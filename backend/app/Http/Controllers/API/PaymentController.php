<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\PayPalService;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(
        private PayPalService $payPalService,
        private StripeService $stripeService,
    ) {}

    // ──────────────────────────────────────────────────────────────
    //  POST /api/payment/create-order  (PayPal)
    //  Receives booking_id, creates a PayPal order, returns approval URL.
    // ──────────────────────────────────────────────────────────────

    public function createOrder(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => ['required', 'integer'],
        ]);

        $booking = Booking::find($request->booking_id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        // Only allow order creation for pending bookings
        if ($booking->payment_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => "Booking is already {$booking->payment_status}.",
            ], 409);
        }

        // Handle free bookings (100% off coupon code)
        if ($booking->total_price <= 0.0) {
            try {
                \Illuminate\Support\Facades\DB::transaction(function () use ($booking) {
                    $booking->update([
                        'payment_status' => 'paid',
                        'payment_id'     => 'free-coupon',
                        'status'         => 'confirmed',
                    ]);
                });

                // Send booking confirmation email
                try {
                    \Illuminate\Support\Facades\Mail::to($booking->email)
                        ->send(new \App\Mail\BookingConfirmation($booking));
                    $booking->update(['confirmation_sent' => true]);
                } catch (\Throwable $mailError) {
                    Log::error('Free booking confirmation email failed', [
                        'booking' => $booking->reference,
                        'email'   => $booking->email,
                        'error'   => $mailError->getMessage(),
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'data'    => [
                        'is_free'           => true,
                        'booking_reference' => $booking->reference,
                    ],
                ]);
            } catch (\Throwable $e) {
                Log::error('Failed to complete free booking', ['error' => $e->getMessage()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to process free booking.',
                ], 500);
            }
        }

        try {
            $orderData = $this->payPalService->createOrder($booking);

            $approvalUrl = collect($orderData['links'] ?? [])
                ->firstWhere('rel', 'approve')['href'] ?? null;

            return response()->json([
                'success' => true,
                'data'    => [
                    'order_id'     => $orderData['id'],
                    'approval_url' => $approvalUrl,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Create PayPal order failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment order.',
            ], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  POST /api/payment/capture  (PayPal)
    //  Receives order_id from PayPal return, captures the payment.
    // ──────────────────────────────────────────────────────────────

    public function capture(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => ['required', 'string', 'max:255'],
        ]);

        try {
            $result = $this->payPalService->captureOrder($request->order_id);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data'    => [
                        'booking_reference' => $result['booking_reference'],
                        'transaction_id'    => $result['transaction_id'],
                        'already_captured'  => $result['already_captured'] ?? false,
                    ],
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['error'] ?? 'Payment capture failed.',
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Capture payment error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Payment processing error.',
            ], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  POST /api/payment/webhook  (PayPal)
    //  PayPal IPN / webhook listener — PAYMENT.CAPTURE.COMPLETED
    // ──────────────────────────────────────────────────────────────

    public function webhook(Request $request): JsonResponse
    {
        $headers = collect($request->headers->all())
            ->mapWithKeys(fn ($v, $k) => [$k => $v[0] ?? ''])
            ->toArray();

        $rawBody = $request->getContent();

        // Verify signature (skip in local/testing to aid development)
        if (app()->environment('production')) {
            if (!$this->payPalService->verifyWebhookSignature($headers, $rawBody)) {
                Log::warning('PayPal webhook signature verification failed');
                return response()->json(['message' => 'Invalid signature'], 403);
            }
        }

        $event     = json_decode($rawBody, true);
        $eventType = $event['event_type'] ?? '';

        Log::info('PayPal webhook received', ['type' => $eventType]);

        if ($eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            $this->payPalService->handleCaptureCompleted($event);
        }

        // Always return 200 so PayPal doesn't retry
        return response()->json(['message' => 'Webhook processed']);
    }

    // ══════════════════════════════════════════════════════════════
    //  STRIPE ENDPOINTS
    // ══════════════════════════════════════════════════════════════

    // ──────────────────────────────────────────────────────────────
    //  POST /api/payment/stripe/create-session
    //  Creates a Stripe Checkout Session and returns the hosted URL.
    // ──────────────────────────────────────────────────────────────

    public function stripeCreateSession(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => ['required', 'integer'],
        ]);

        $booking = Booking::find($request->booking_id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        if ($booking->payment_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => "Booking is already {$booking->payment_status}.",
            ], 409);
        }

        // Handle free bookings (100% coupon)
        if ($booking->total_price <= 0.0) {
            return $this->processFreeBooking($booking);
        }

        try {
            $sessionData = $this->stripeService->createCheckoutSession($booking);

            return response()->json([
                'success' => true,
                'data'    => [
                    'session_url' => $sessionData['session_url'],
                    'session_id'  => $sessionData['session_id'],
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Create Stripe session failed', [
                'booking_id' => $booking->id,
                'error'      => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => config('app.debug') ? $e->getMessage() : 'Failed to create Stripe payment session.',
            ], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  POST /api/payment/stripe/capture
    //  Called after Stripe returns user to /payment/stripe/success.
    //  Verifies the session is paid and updates DB records.
    // ──────────────────────────────────────────────────────────────

    public function stripeCapture(Request $request): JsonResponse
    {
        $request->validate([
            'session_id' => ['required', 'string', 'max:500'],
        ]);

        try {
            $result = $this->stripeService->fulfillCheckoutSession($request->session_id);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data'    => [
                        'booking_reference' => $result['booking_reference'],
                        'transaction_id'    => $result['transaction_id'],
                        'already_captured'  => $result['already_captured'] ?? false,
                    ],
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['error'] ?? 'Stripe payment verification failed.',
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Stripe capture error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Stripe payment processing error.',
            ], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  POST /api/payment/stripe/webhook
    //  Stripe webhook listener — checkout.session.completed
    // ──────────────────────────────────────────────────────────────

    public function stripeWebhook(Request $request): JsonResponse
    {
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature', '');

        // Skip signature verification in local env
        if (app()->environment('production')) {
            try {
                $event = $this->stripeService->constructWebhookEvent($payload, $sigHeader);
            } catch (\Stripe\Exception\SignatureVerificationException $e) {
                Log::warning('Stripe webhook signature verification failed', ['error' => $e->getMessage()]);
                return response()->json(['message' => 'Invalid signature'], 403);
            }
        } else {
            $event = json_decode($payload, true);
            $event = (object) ['type' => $event['type'] ?? '', 'data' => (object) ['object' => $event['data']['object'] ?? []]];
        }

        $eventType = $event->type ?? '';

        Log::info('Stripe webhook received', ['type' => $eventType]);

        if ($eventType === 'checkout.session.completed') {
            $sessionData = (array) ($event->data->object ?? []);
            $this->stripeService->handleSessionCompleted($sessionData);
        }

        // Always return 200 so Stripe doesn't retry
        return response()->json(['message' => 'Webhook processed']);
    }

    // ──────────────────────────────────────────────────────────────
    //  Internal: handle free bookings (shared between PayPal & Stripe paths)
    // ──────────────────────────────────────────────────────────────

    private function processFreeBooking(Booking $booking): JsonResponse
    {
        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($booking) {
                $booking->update([
                    'payment_status' => 'paid',
                    'payment_id'     => 'free-coupon',
                    'status'         => 'confirmed',
                ]);
            });

            try {
                \Illuminate\Support\Facades\Mail::to($booking->email)
                    ->send(new \App\Mail\BookingConfirmation($booking));
                $booking->update(['confirmation_sent' => true]);
            } catch (\Throwable $mailError) {
                Log::error('Free booking confirmation email failed', [
                    'booking' => $booking->reference,
                    'error'   => $mailError->getMessage(),
                ]);
            }

            return response()->json([
                'success' => true,
                'data'    => [
                    'is_free'           => true,
                    'booking_reference' => $booking->reference,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to complete free booking', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to process free booking.',
            ], 500);
        }
    }
}
