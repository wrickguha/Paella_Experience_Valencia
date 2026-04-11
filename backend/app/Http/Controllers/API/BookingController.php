<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\CreateBookingRequest;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService,
    ) {}

    /**
     * POST /api/booking/create
     * Creates booking in the DB with payment_status=pending.
     * Frontend then calls /api/payment/create-order to start PayPal flow.
     */
    public function create(CreateBookingRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            // Associate booking with authenticated user
            $data['user_id'] = $request->user()->id;

            $booking = $this->bookingService->createBooking($data);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'booking' => [
                    'id' => $booking->id,
                    'reference' => $booking->reference,
                    'total_price' => (float) $booking->total_price,
                    'guests' => $booking->guests,
                    'date' => $booking->date->format('Y-m-d'),
                    'time' => $booking->time,
                    'location' => $booking->location->name_en,
                    'experience' => $booking->experience->title_en,
                ],
            ],
        ], 201);
    }
}
