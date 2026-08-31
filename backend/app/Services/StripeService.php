<?php

namespace App\Services;

use App\Mail\BookingConfirmation;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Stripe\Checkout\Session;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeService
{
    private string $currency;
    private string $webhookSecret;

    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret', ''));
        $this->currency     = strtoupper(config('services.stripe.currency', 'EUR'));
        $this->webhookSecret = config('services.stripe.webhook_secret', '');
    }

    // ──────────────────────────────────────────────────────────────
    //  Create Checkout Session
    //  Called before redirecting the user to Stripe Checkout
    // ──────────────────────────────────────────────────────────────

    public function createCheckoutSession(Booking $booking): array
    {
        $secretKey = config('services.stripe.secret', '');
        if (empty($secretKey) || $secretKey === 'sk_live_REPLACE_ME') {
            throw new \RuntimeException('Stripe credentials not configured.');
        }

        Stripe::setApiKey($secretKey);

        // Prevent duplicate sessions for the same booking
        $existingPayment = Payment::where('booking_id', $booking->id)
            ->whereIn('status', ['created', 'approved'])
            ->where('payment_method', 'stripe')
            ->first();

        if ($existingPayment && $existingPayment->stripe_session_id) {
            // Re-use the existing session rather than creating a duplicate
            try {
                $session = Session::retrieve($existingPayment->stripe_session_id);
                if ($session->status === 'open') {
                    return ['session_url' => $session->url, 'session_id' => $session->id];
                }
            } catch (\Throwable $e) {
                Log::warning('Could not retrieve existing Stripe session, creating new one', [
                    'session_id' => $existingPayment->stripe_session_id,
                    'error'      => $e->getMessage(),
                ]);
            }
        }

        $amount = (int) round($booking->total_price * 100); // Stripe uses smallest currency unit (cents)
        $appUrl = rtrim(config('app.frontend_url') ?: config('app.url'), '/');

        $experienceTitle = $booking->experience?->title_en ?? 'Paella Experience Valencia';

        $sessionParams = [
            'mode'        => 'payment',
            'line_items'  => [
                [
                    'price_data' => [
                        'currency'     => strtolower($this->currency),
                        'unit_amount'  => $amount,
                        'product_data' => [
                            'name'        => "Paella Experience – {$experienceTitle}",
                            'description' => "Booking reference: {$booking->reference} · {$booking->guests} guest(s) · {$booking->date}",
                        ],
                    ],
                    'quantity'   => 1,
                ],
            ],
            'success_url'      => "{$appUrl}/payment/stripe/success?session_id={CHECKOUT_SESSION_ID}&ref={$booking->reference}",
            'cancel_url'       => "{$appUrl}/payment/cancel?ref={$booking->reference}",
            'metadata'         => [
                'booking_id'        => (string) $booking->id,
                'booking_reference' => (string) $booking->reference,
            ],
            'payment_intent_data' => [
                'description' => "Booking {$booking->reference} – Paella Experience Valencia",
            ],
        ];

        if (!empty($booking->email)) {
            $sessionParams['customer_email'] = $booking->email;
        }

        $session = Session::create($sessionParams);

        // Persist payment record
        Payment::create([
            'booking_id'        => $booking->id,
            'payment_method'    => 'stripe',
            'stripe_session_id' => $session->id,
            'amount'            => $booking->total_price,
            'status'            => 'created',
            'response_json'     => $session->toArray(),
        ]);

        return [
            'session_url' => $session->url,
            'session_id'  => $session->id,
        ];
    }

    // ──────────────────────────────────────────────────────────────
    //  Fulfill Checkout Session
    //  Called when the user returns from Stripe's hosted page.
    //  Idempotent — safe to call multiple times for the same session.
    // ──────────────────────────────────────────────────────────────

    public function fulfillCheckoutSession(string $sessionId): array
    {
        return DB::transaction(function () use ($sessionId) {

            $payment = Payment::where('stripe_session_id', $sessionId)
                ->lockForUpdate()
                ->first();

            if (!$payment) {
                throw new \RuntimeException('Stripe payment record not found.');
            }

            // Already completed — idempotent success
            if ($payment->status === 'completed') {
                return [
                    'success'           => true,
                    'already_captured'  => true,
                    'booking_reference' => $payment->booking->reference,
                    'transaction_id'    => $payment->transaction_id,
                ];
            }

            // Retrieve the session from Stripe to verify payment
            Stripe::setApiKey(config('services.stripe.secret', ''));
            $session = Session::retrieve([
                'id'     => $sessionId,
                'expand' => ['payment_intent'],
            ]);

            if ($session->payment_status !== 'paid') {
                return [
                    'success' => false,
                    'error'   => 'Payment has not been completed.',
                ];
            }

            $transactionId = $session->payment_intent->id ?? $sessionId;

            $payment->update([
                'status'         => 'completed',
                'transaction_id' => $transactionId,
                'response_json'  => $session->toArray(),
            ]);

            $booking = $payment->booking;

            $booking->update([
                'payment_status' => 'paid',
                'payment_id'     => $transactionId,
                'status'         => 'confirmed',
            ]);

            Log::info('Stripe payment fulfilled', [
                'booking'        => $booking->reference,
                'transaction_id' => $transactionId,
                'amount'         => $payment->amount,
            ]);

            // Send booking confirmation email
            try {
                Mail::to($booking->email)->send(new BookingConfirmation($booking));
                $booking->update(['confirmation_sent' => true]);
            } catch (\Throwable $mailError) {
                Log::error('Stripe booking confirmation email failed', [
                    'booking' => $booking->reference,
                    'email'   => $booking->email,
                    'error'   => $mailError->getMessage(),
                ]);
            }

            return [
                'success'           => true,
                'booking_reference' => $booking->reference,
                'transaction_id'    => $transactionId,
            ];
        });
    }

    // ──────────────────────────────────────────────────────────────
    //  Construct & Verify Webhook Event
    // ──────────────────────────────────────────────────────────────

    /**
     * @throws SignatureVerificationException
     */
    public function constructWebhookEvent(string $payload, string $sigHeader): \Stripe\Event
    {
        return Webhook::constructEvent($payload, $sigHeader, $this->webhookSecret);
    }

    // ──────────────────────────────────────────────────────────────
    //  Handle checkout.session.completed webhook event
    // ──────────────────────────────────────────────────────────────

    public function handleSessionCompleted(array $sessionData): void
    {
        $sessionId = $sessionData['id'] ?? null;

        if (!$sessionId) {
            Log::warning('Stripe webhook: missing session ID', ['data' => $sessionData]);
            return;
        }

        try {
            $result = $this->fulfillCheckoutSession($sessionId);

            if (!($result['success'] ?? false)) {
                Log::warning('Stripe webhook: fulfillment failed', [
                    'session_id' => $sessionId,
                    'error'      => $result['error'] ?? 'unknown',
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Stripe webhook: fulfillment exception', [
                'session_id' => $sessionId,
                'error'      => $e->getMessage(),
            ]);
        }
    }
}
