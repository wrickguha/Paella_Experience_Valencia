<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\CapturePaymentRequest;
use App\Services\PayPalService;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function __construct(
        private PayPalService $payPalService,
    ) {}

    /**
     * POST /api/payment/paypal
     * Captures a PayPal order after user approval.
     */
    public function capturePayPal(CapturePaymentRequest $request): JsonResponse
    {
        try {
            $result = $this->payPalService->captureOrder($request->validated()['paypal_order_id']);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => $result,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['error'] ?? 'Payment capture failed.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment processing error.',
            ], 500);
        }
    }
}
