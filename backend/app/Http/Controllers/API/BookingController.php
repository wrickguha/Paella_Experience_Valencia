<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\CreateBookingRequest;
use App\Services\BookingService;
use App\Services\PayPalService;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService,
        private PayPalService $payPalService,
    ) {}

    /**
     * POST /api/booking/create
     */
    public function create(CreateBookingRequest $request): JsonResponse
    {
        try {
            $booking = $this->bookingService->createBooking($request->validated());

            // Auto-create PayPal order
            $paypalOrder = $this->payPalService->createOrder($booking);

            // Find approval URL
            $approvalUrl = collect($paypalOrder['links'] ?? [])
                ->firstWhere('rel', 'approve')['href'] ?? null;

            return response()->json([
                'success' => true,
                'data' => [
                    'booking' => [
                        'reference' => $booking->reference,
                        'total_price' => (float) $booking->total_price,
                        'guests' => $booking->guests,
                        'date' => $booking->date->format('Y-m-d'),
                        'time' => $booking->time,
                        'location' => $booking->location->name_en,
                        'experience' => $booking->experience->title_en,
                    ],
                    'paypal' => [
                        'order_id' => $paypalOrder['id'],
                        'approval_url' => $approvalUrl,
                    ],
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
