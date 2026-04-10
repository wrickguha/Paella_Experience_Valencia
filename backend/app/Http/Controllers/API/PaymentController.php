<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\PayPalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(
        private PayPalService $payPalService,
    ) {}

    // ──────────────────────────────────────────────────────────────
    //  POST /api/payment/create-order
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

        try {
            $orderData = $this->payPalService->createOrder($booking);

            $approvalUrl = collect($orderData['links'] ?? [])
                ->firstWhere('rel', 'approve')['href'] ?? null;

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $orderData['id'],
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
    //  POST /api/payment/capture
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
                    'data' => [
                        'booking_reference' => $result['booking_reference'],
                        'transaction_id' => $result['transaction_id'],
                        'already_captured' => $result['already_captured'] ?? false,
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
    //  POST /api/payment/webhook
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

        $event = json_decode($rawBody, true);
        $eventType = $event['event_type'] ?? '';

        Log::info('PayPal webhook received', ['type' => $eventType]);

        if ($eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            $this->payPalService->handleCaptureCompleted($event);
        }

        // Always return 200 so PayPal doesn't retry
        return response()->json(['message' => 'Webhook processed']);
    }
}
