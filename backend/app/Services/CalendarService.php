<?php

namespace App\Services;

use App\Models\AvailabilitySlot;
use App\Models\Location;
use App\Models\Schedule;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;

class CalendarService
{
    /**
     * Get calendar data for a location for a given month.
     * Combines weekly schedules with availability_slots overrides.
     *
     * @return Collection<int, array>
     */
    public function getMonthCalendar(int $locationId, int $year, int $month): Collection
    {
        $location = Location::with('schedules')->findOrFail($locationId);
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $today = Carbon::today();

        // Fetch existing availability_slots for this range
        $existingSlots = AvailabilitySlot::forLocation($locationId)
            ->whereBetween('date', [$start, $end])
            ->get()
            ->keyBy(function ($slot) {
                return $slot->date->format('Y-m-d') . '_' . $slot->start_time;
            });

        $calendar = collect();
        $activeSchedules = $location->schedules->where('is_active', true);

        $period = CarbonPeriod::create($start, $end);

        foreach ($period as $date) {
            // Skip past dates
            if ($date->lt($today)) {
                continue;
            }

            $dayOfWeek = $date->dayOfWeek; // 0=Sunday

            // Find schedules for this day of week
            $daySchedules = $activeSchedules->where('day_of_week', $dayOfWeek);

            foreach ($daySchedules as $schedule) {
                $slotKey = $date->format('Y-m-d') . '_' . $schedule->start_time;

                if ($existingSlots->has($slotKey)) {
                    $slot = $existingSlots->get($slotKey);
                    $calendar->push([
                        'date' => $date->format('Y-m-d'),
                        'location_id' => $locationId,
                        'location' => $location->name_en,
                        'start_time' => $slot->start_time,
                        'end_time' => $slot->end_time,
                        'total_slots' => $slot->total_slots,
                        'booked_slots' => $slot->booked_slots,
                        'available_slots' => $slot->remaining,
                        'is_available' => $slot->is_available,
                        'slot_id' => $slot->id,
                    ]);
                } else {
                    // Auto-generate from weekly schedule
                    $calendar->push([
                        'date' => $date->format('Y-m-d'),
                        'location_id' => $locationId,
                        'location' => $location->name_en,
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                        'total_slots' => 12,
                        'booked_slots' => 0,
                        'available_slots' => 12,
                        'is_available' => true,
                        'slot_id' => null, // not yet materialized
                    ]);
                }
            }
        }

        return $calendar->sortBy('date')->values();
    }

    /**
     * Get combined calendar for ALL active locations for a given month.
     */
    public function getAllLocationsCalendar(int $year, int $month): Collection
    {
        $locations = Location::active()->get();
        $combined = collect();

        foreach ($locations as $location) {
            $combined = $combined->merge($this->getMonthCalendar($location->id, $year, $month));
        }

        return $combined->sortBy('date')->values();
    }

    /**
     * Check availability for a specific date and location.
     */
    public function getAvailability(int $locationId, string $date): Collection
    {
        $carbonDate = Carbon::parse($date);
        $dayOfWeek = $carbonDate->dayOfWeek;

        // Check explicit slots first
        $explicitSlots = AvailabilitySlot::forLocation($locationId)
            ->forDate($date)
            ->get();

        if ($explicitSlots->isNotEmpty()) {
            return $explicitSlots->map(function ($slot) use ($locationId) {
                return [
                    'slot_id' => $slot->id,
                    'location_id' => $locationId,
                    'date' => $slot->date->format('Y-m-d'),
                    'start_time' => $slot->start_time,
                    'end_time' => $slot->end_time,
                    'total_slots' => $slot->total_slots,
                    'available_slots' => $slot->remaining,
                    'is_available' => $slot->is_available,
                ];
            });
        }

        // Fall back to weekly schedule
        $schedules = Schedule::where('location_id', $locationId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->get();

        return $schedules->map(function ($schedule) use ($locationId, $date) {
            return [
                'slot_id' => null,
                'location_id' => $locationId,
                'date' => $date,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'total_slots' => 12,
                'available_slots' => 12,
                'is_available' => true,
            ];
        });
    }
}
