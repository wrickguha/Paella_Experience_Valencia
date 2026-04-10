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

    public function __construct()
    {
        $this->clientId = config('services.paypal.client_id', '');
        $this->clientSecret = config('services.paypal.client_secret', '');
        $this->baseUrl = config('services.paypal.sandbox')
            ? 'https://api-m.sandbox.paypal.com'
            : 'https://api-m.paypal.com';
    }

    /**
     * Get OAuth token from PayPal.
     */
    private function getAccessToken(): string
    {
        $response = Http::asForm()
            ->withBasicAuth($this->clientId, $this->clientSecret)
            ->post("{$this->baseUrl}/v1/oauth2/token", [
                'grant_type' => 'client_credentials',
            ]);

        if (!$response->successful()) {
            Log::error('PayPal auth failed', ['response' => $response->json()]);
            throw new \Exception('PayPal authentication failed.');
        }

        return $response->json('access_token');
    }

    /**
     * Create a PayPal order for a booking.
     */
    public function createOrder(Booking $booking): array
    {
        $token = $this->getAccessToken();

        $response = Http::withToken($token)
            ->post("{$this->baseUrl}/v2/checkout/orders", [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'reference_id' => $booking->reference,
                        'description' => "Paella Experience - {$booking->experience->title_en}",
                        'amount' => [
                            'currency_code' => 'EUR',
                            'value' => number_format((float) $booking->total_price, 2, '.', ''),
                        ],
                    ],
                ],
                'application_context' => [
                    'return_url' => config('app.frontend_url') . '/payment/success?booking=' . $booking->reference,
                    'cancel_url' => config('app.frontend_url') . '/payment/cancel?booking=' . $booking->reference,
                    'brand_name' => 'Paella Experience Valencia',
                    'user_action' => 'PAY_NOW',
                ],
            ]);

        if (!$response->successful()) {
            Log::error('PayPal create order failed', ['response' => $response->json()]);
            throw new \Exception('Failed to create PayPal order.');
        }

        $orderData = $response->json();

        // Store payment record
        Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'paypal',
            'paypal_order_id' => $orderData['id'],
            'amount' => $booking->total_price,
            'status' => 'created',
            'response_json' => $orderData,
        ]);

        $booking->update(['payment_id' => $orderData['id']]);

        return $orderData;
    }

    /**
     * Capture a PayPal order after user approval.
     */
    public function captureOrder(string $paypalOrderId): array
    {
        return DB::transaction(function () use ($paypalOrderId) {
            $token = $this->getAccessToken();

            $response = Http::withToken($token)
                ->post("{$this->baseUrl}/v2/checkout/orders/{$paypalOrderId}/capture");

            $captureData = $response->json();

            $payment = Payment::where('paypal_order_id', $paypalOrderId)->firstOrFail();

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

                return [
                    'success' => true,
                    'booking_reference' => $payment->booking->reference,
                    'transaction_id' => $transactionId,
                ];
            }

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

            Log::error('PayPal capture failed', ['response' => $captureData]);

            return [
                'success' => false,
                'error' => $captureData['message'] ?? 'Payment capture failed.',
            ];
        });
    }
}
