<?php

namespace App\Services;

use App\Models\AvailabilitySlot;
use App\Models\Booking;
use App\Models\Experience;
use Illuminate\Support\Facades\DB;

class BookingService
{
    /**
     * Create a booking with overbooking protection via DB transaction.
     *
     * @throws \Exception
     */
    public function createBooking(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $experience = Experience::findOrFail($data['experience_id']);

            // Materialise or lock the availability slot
            $slot = $this->resolveAndLockSlot(
                $data['location_id'],
                $data['date'],
                $data['time'],
            );

            // Overbooking guard
            $requestedGuests = (int) $data['guests'];
            if ($slot->remaining < $requestedGuests) {
                throw new \Exception("Only {$slot->remaining} spots left for this session.");
            }

            // Calculate total
            $totalPrice = $experience->price * $requestedGuests;

            // Create booking
            $booking = Booking::create([
                'user_id' => $data['user_id'] ?? null,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'location_id' => $data['location_id'],
                'experience_id' => $data['experience_id'],
                'availability_slot_id' => $slot->id,
                'date' => $data['date'],
                'time' => $data['time'],
                'guests' => $requestedGuests,
                'total_price' => $totalPrice,
                'payment_status' => 'pending',
            ]);

            // Increment booked_slots
            $slot->increment('booked_slots', $requestedGuests);

            return $booking->load(['location', 'experience']);
        });
    }

    /**
     * Materialise an availability slot if it doesn't exist yet, then lock it.
     */
    private function resolveAndLockSlot(int $locationId, string $date, string $time): AvailabilitySlot
    {
        $slot = AvailabilitySlot::where('location_id', $locationId)
            ->where('date', $date)
            ->where('start_time', $time)
            ->lockForUpdate()
            ->first();

        if (!$slot) {
            // Create from schedule template
            $slot = AvailabilitySlot::create([
                'location_id' => $locationId,
                'date' => $date,
                'start_time' => $time,
                'end_time' => \Carbon\Carbon::parse($time)->addHours(4)->format('H:i'),
                'total_slots' => 12,
                'booked_slots' => 0,
            ]);

            // Re-lock
            $slot = AvailabilitySlot::lockForUpdate()->find($slot->id);
        }

        if ($slot->is_blocked) {
            throw new \Exception('This session is no longer available.');
        }

        return $slot;
    }
}
