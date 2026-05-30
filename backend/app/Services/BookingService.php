<?php

namespace App\Services;

use App\Models\AvailabilitySlot;
use App\Models\Booking;
use App\Models\Coupon;
use App\Models\Experience;
use App\Models\Schedule;
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
            $couponCode = isset($data['coupon_code']) ? strtoupper(trim($data['coupon_code'])) : null;
            $discountPercent = null;
            $discountAmount = null;

            if (!empty($couponCode)) {
                $coupon = Coupon::active()->where('code', $couponCode)->first();
                if (! $coupon) {
                    throw new \Exception('Coupon code is invalid or inactive.');
                }

                $discountPercent = $coupon->discount_percent;
                $discountAmount = round($totalPrice * ($discountPercent / 100), 2);
                $totalPrice = max(0, $totalPrice - $discountAmount);
            }

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
                'coupon_code' => $couponCode,
                'discount_percent' => $discountPercent,
                'discount_amount' => $discountAmount,
                'total_price' => $totalPrice,
                'payment_status' => 'pending',
                'language_preference' => $data['language_preference'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'pending',
            ]);

            return $booking->load(['location', 'experience']);
        });
    }

    /**
     * Materialise an availability slot if it doesn't exist yet, then lock it.
     * The requested time is snapped to the nearest active schedule time for this
     * location (within 90 minutes) so that minor clock differences never create
     * orphan slots that diverge from the calendar.
     */
    private function resolveAndLockSlot(int $locationId, string $date, string $time): AvailabilitySlot
    {
        // Snap the requested time to the nearest schedule time (within 90 min)
        $canonicalTime = $this->snapToScheduleTime($locationId, $date, $time);

        $slot = AvailabilitySlot::where('location_id', $locationId)
            ->where('date', $date)
            ->where('start_time', $canonicalTime)
            ->lockForUpdate()
            ->first();

        if (!$slot) {
            // Look up schedule end_time for proper duration
            $scheduleEndTime = $this->getScheduleEndTime($locationId, $date, $canonicalTime);

            $slot = AvailabilitySlot::create([
                'location_id' => $locationId,
                'date'        => $date,
                'start_time'  => $canonicalTime,
                'end_time'    => $scheduleEndTime ?? \Carbon\Carbon::parse($canonicalTime)->addHours(4)->format('H:i'),
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

    /**
     * Find the closest active schedule start_time for this location/date within 90 minutes.
     * Returns the original time if no schedule is found (fallback).
     */
    private function snapToScheduleTime(int $locationId, string $date, string $time): string
    {
        $dayOfWeek = \Carbon\Carbon::parse($date)->dayOfWeek;
        $reqMin = \Carbon\Carbon::parse($time)->hour * 60 + \Carbon\Carbon::parse($time)->minute;

        // Collect all active schedule times for this location on this day
        $scheduleTimes = Schedule::where('location_id', $locationId)
            ->where('is_active', true)
            ->where(function ($q) use ($dayOfWeek, $date) {
                $q->where(fn($q2) => $q2->where('day_of_week', $dayOfWeek)->whereNull('date'))
                  ->orWhere(fn($q2) => $q2->where('date', $date)->whereNull('day_of_week'));
            })
            ->pluck('start_time');

        if ($scheduleTimes->isEmpty()) {
            return $time; // no schedule, keep as-is
        }

        $best = null;
        $bestDiff = PHP_INT_MAX;

        foreach ($scheduleTimes as $schedTime) {
            $schedMin = \Carbon\Carbon::parse($schedTime)->hour * 60 + \Carbon\Carbon::parse($schedTime)->minute;
            $diff = abs($schedMin - $reqMin);
            if ($diff < $bestDiff && $diff <= 90) {
                $bestDiff = $diff;
                $best = $schedTime;
            }
        }

        return $best ?? $time;
    }

    /**
     * Get the end_time from the schedule for a given location/date/startTime.
     */
    private function getScheduleEndTime(int $locationId, string $date, string $startTime): ?string
    {
        $dayOfWeek = \Carbon\Carbon::parse($date)->dayOfWeek;
        $schedule = Schedule::where('location_id', $locationId)
            ->where('is_active', true)
            ->where('start_time', $startTime)
            ->where(function ($q) use ($dayOfWeek, $date) {
                $q->where(fn($q2) => $q2->where('day_of_week', $dayOfWeek)->whereNull('date'))
                  ->orWhere(fn($q2) => $q2->where('date', $date)->whereNull('day_of_week'));
            })
            ->first();

        return $schedule?->end_time;
    }
}
