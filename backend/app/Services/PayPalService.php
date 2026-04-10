<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayPalService
{
    private string $clientId;
    private string $clientSecret;
    private string $baseUrl;
    private string $currency;
    private string $payeeEmail;

    public function __construct()
    {
        $this->clientId = config('services.paypal.client_id', '');
        $this->clientSecret = config('services.paypal.client_secret', '');
        $this->currency = config('services.paypal.currency', 'EUR');
        $this->payeeEmail = config('services.paypal.payee_email', 'joy97ta@gmail.com');
        $this->baseUrl = config('services.paypal.mode') === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }

    // ──────────────────────────────────────────────────────────────
    //  OAuth Token
    // ──────────────────────────────────────────────────────────────

    private function getAccessToken(): string
    {
        if (empty($this->clientId) || $this->clientId === 'your-sandbox-client-id') {
            throw new \RuntimeException('PayPal credentials not configured.');
        }

        $response = Http::asForm()
            ->withBasicAuth($this->clientId, $this->clientSecret)
            ->post("{$this->baseUrl}/v1/oauth2/token", [
                'grant_type' => 'client_credentials',
            ]);

        if (!$response->successful()) {
            Log::error('PayPal auth failed', ['status' => $response->status(), 'body' => $response->json()]);
            throw new \RuntimeException('PayPal authentication failed.');
        }

        return $response->json('access_token');
    }

    // ──────────────────────────────────────────────────────────────
    //  Create Order
    // ──────────────────────────────────────────────────────────────

    public function createOrder(Booking $booking): array
    {
        // Prevent duplicate PayPal orders for the same booking
        $existingPayment = Payment::where('booking_id', $booking->id)
            ->whereIn('status', ['created', 'approved'])
            ->first();

        if ($existingPayment) {
            throw new \RuntimeException('A payment order already exists for this booking.');
        }

        $token = $this->getAccessToken();

        $amount = number_format((float) $booking->total_price, 2, '.', '');
        $appUrl = config('app.url');

        $response = Http::withToken($token)
            ->post("{$this->baseUrl}/v2/checkout/orders", [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'reference_id' => $booking->reference,
                        'description' => "Paella Experience – {$booking->experience->title_en}",
                        'amount' => [
                            'currency_code' => $this->currency,
                            'value' => $amount,
                        ],
                        'payee' => [
                            'email_address' => $this->payeeEmail,
                        ],
                    ],
                ],
                'application_context' => [
                    'return_url' => "{$appUrl}/payment/success?ref={$booking->reference}",
                    'cancel_url' => "{$appUrl}/payment/cancel?ref={$booking->reference}",
                    'brand_name' => 'Paella Experience Valencia',
                    'user_action' => 'PAY_NOW',
                    'shipping_preference' => 'NO_SHIPPING',
                ],
            ]);

        if (!$response->successful()) {
            Log::error('PayPal create order failed', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);
            throw new \RuntimeException('Failed to create PayPal order.');
        }

        $orderData = $response->json();

        // Persist payment record
        Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'paypal',
            'paypal_order_id' => $orderData['id'],
            'amount' => $booking->total_price,
            'status' => 'created',
            'response_json' => $orderData,
        ]);

        return $orderData;
    }

    // ──────────────────────────────────────────────────────────────
    //  Capture Order  (called after user approves on PayPal)
    // ──────────────────────────────────────────────────────────────

    public function captureOrder(string $paypalOrderId): array
    {
        return DB::transaction(function () use ($paypalOrderId) {

            // Lock the payment row to prevent double capture
            $payment = Payment::where('paypal_order_id', $paypalOrderId)
                ->lockForUpdate()
                ->first();

            if (!$payment) {
                throw new \RuntimeException('Payment record not found.');
            }

            // Already captured — idempotent success
            if ($payment->status === 'completed') {
                return [
                    'success' => true,
                    'already_captured' => true,
                    'booking_reference' => $payment->booking->reference,
                    'transaction_id' => $payment->transaction_id,
                ];
            }

            // Only capture orders in created/approved state
            if (!in_array($payment->status, ['created', 'approved'], true)) {
                throw new \RuntimeException("Cannot capture payment in '{$payment->status}' state.");
            }

            $token = $this->getAccessToken();

            $response = Http::withToken($token)
                ->withHeaders(['PayPal-Request-Id' => "capture-{$paypalOrderId}"])
                ->post("{$this->baseUrl}/v2/checkout/orders/{$paypalOrderId}/capture");

            $captureData = $response->json();

            if ($response->successful() && ($captureData['status'] ?? '') === 'COMPLETED') {
                $transactionId = $captureData['purchase_units'][0]['payments']['captures'][0]['id'] ?? null;

                $payment->update([
                    'status' => 'completed',
                    'transaction_id' => $transactionId,
                    'response_json' => $captureData,
                ]);

                $payment->booking->update([
                    'payment_status' => 'paid',
                    'payment_id' => $transactionId ?? $paypalOrderId,
                ]);

                Log::info('Payment captured', [
                    'booking' => $payment->booking->reference,
                    'transaction_id' => $transactionId,
                    'amount' => $payment->amount,
                ]);

                return [
                    'success' => true,
                    'booking_reference' => $payment->booking->reference,
                    'transaction_id' => $transactionId,
                ];
            }

            // Capture failed
            $payment->update([
                'status' => 'failed',
                'response_json' => $captureData,
            ]);

            $payment->booking->update(['payment_status' => 'failed']);

            // Release booked slots on failure
            $slot = $payment->booking->availabilitySlot;
            if ($slot) {
                $slot->decrement('booked_slots', $payment->booking->guests);
            }

            Log::error('PayPal capture failed', [
                'order_id' => $paypalOrderId,
                'response' => $captureData,
            ]);

            return [
                'success' => false,
                'error' => $captureData['message'] ?? 'Payment capture failed.',
            ];
        });
    }

    // ──────────────────────────────────────────────────────────────
    //  Webhook Verification
    // ──────────────────────────────────────────────────────────────

    public function verifyWebhookSignature(array $headers, string $rawBody): bool
    {
        try {
            $token = $this->getAccessToken();

            $response = Http::withToken($token)
                ->post("{$this->baseUrl}/v1/notifications/verify-webhook-signature", [
                    'auth_algo' => $headers['paypal-auth-algo'] ?? '',
                    'cert_url' => $headers['paypal-cert-url'] ?? '',
                    'transmission_id' => $headers['paypal-transmission-id'] ?? '',
                    'transmission_sig' => $headers['paypal-transmission-sig'] ?? '',
                    'transmission_time' => $headers['paypal-transmission-time'] ?? '',
                    'webhook_id' => config('services.paypal.webhook_id', ''),
                    'webhook_event' => json_decode($rawBody, true),
                ]);

            return $response->successful()
                && ($response->json('verification_status') === 'SUCCESS');
        } catch (\Throwable $e) {
            Log::error('Webhook verification failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Handle PAYMENT.CAPTURE.COMPLETED webhook event
    // ──────────────────────────────────────────────────────────────

    public function handleCaptureCompleted(array $event): void
    {
        $resource = $event['resource'] ?? [];
        $transactionId = $resource['id'] ?? null;

        if (!$transactionId) {
            Log::warning('Webhook missing transaction ID', ['event' => $event]);
            return;
        }

        DB::transaction(function () use ($resource, $transactionId) {
            // Find via supplementary_data → order_id or via transaction_id
            $orderId = $resource['supplementary_data']['related_ids']['order_id'] ?? null;

            $payment = $orderId
                ? Payment::where('paypal_order_id', $orderId)->lockForUpdate()->first()
                : Payment::where('transaction_id', $transactionId)->lockForUpdate()->first();

            if (!$payment) {
                Log::warning('Webhook: no matching payment', [
                    'transaction_id' => $transactionId,
                    'order_id' => $orderId,
                ]);
                return;
            }

            // Already completed — nothing to do
            if ($payment->status === 'completed') {
                return;
            }

            $payment->update([
                'status' => 'completed',
                'transaction_id' => $transactionId,
            ]);

            $payment->booking->update([
                'payment_status' => 'paid',
                'payment_id' => $transactionId,
            ]);

            Log::info('Webhook captured payment', [
                'booking' => $payment->booking->reference,
                'transaction_id' => $transactionId,
            ]);
        });
    }
}
