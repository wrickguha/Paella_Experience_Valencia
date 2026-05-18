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

        // Get the primary experience for this location
        $experience = $location->experiences()->where('is_active', true)->orderBy('sort_order')->first();
        $experienceId = $experience?->id;
        $experiencePrice = $experience ? (float) $experience->price : 0;

        // Fetch existing availability_slots for this range
        $existingSlots = AvailabilitySlot::forLocation($locationId)
            ->whereBetween('date', [$start, $end])
            ->get()
            ->keyBy(function ($slot) {
                return $slot->date->format('Y-m-d') . '_' . $slot->start_time;
            });

        $calendar = collect();
        $activeSchedules = $location->schedules->where('is_active', true);

        // Separate weekly schedules (day_of_week set) from custom-date schedules (date set)
        $weeklySchedules = $activeSchedules->filter(fn($s) => !is_null($s->day_of_week));
        $customSchedules = $activeSchedules->filter(fn($s) => is_null($s->day_of_week) && !is_null($s->date));

        // ── 1. Weekly schedules: expand across the month ───────────
        $period = CarbonPeriod::create($start, $end);

        foreach ($period as $date) {
            if ($date->lt($today)) {
                continue;
            }

            $dayOfWeek = $date->dayOfWeek;
            $daySchedules = $weeklySchedules->where('day_of_week', $dayOfWeek);

            foreach ($daySchedules as $schedule) {
                $slotKey = $date->format('Y-m-d') . '_' . $schedule->start_time;

                if ($existingSlots->has($slotKey)) {
                    $slot = $existingSlots->get($slotKey);
                    $calendar->push([
                        'date'             => $date->format('Y-m-d'),
                        'location_id'      => $locationId,
                        'location'         => $location->name_en,
                        'experience_id'    => $experienceId,
                        'experience_price' => $experiencePrice,
                        'start_time'       => $slot->start_time,
                        'end_time'         => $slot->end_time,
                        'total_slots'      => $slot->total_slots,
                        'booked_slots'     => $slot->booked_slots,
                        'available_slots'  => $slot->remaining,
                        'is_available'     => $slot->is_available,
                        'slot_id'          => $slot->id,
                    ]);
                } else {
                    $calendar->push([
                        'date'             => $date->format('Y-m-d'),
                        'location_id'      => $locationId,
                        'location'         => $location->name_en,
                        'experience_id'    => $experienceId,
                        'experience_price' => $experiencePrice,
                        'start_time'       => $schedule->start_time,
                        'end_time'         => $schedule->end_time,
                        'total_slots'      => 12,
                        'booked_slots'     => 0,
                        'available_slots'  => 12,
                        'is_available'     => true,
                        'slot_id'          => null,
                    ]);
                }
            }
        }

        // ── 2. Custom-date schedules: only on their exact date ─────
        foreach ($customSchedules as $schedule) {
            $scheduleDate = $schedule->date instanceof Carbon
                ? $schedule->date
                : Carbon::parse($schedule->date);

            // Skip if outside this month or in the past
            if ($scheduleDate->lt($today) || $scheduleDate->month !== $month || $scheduleDate->year !== $year) {
                continue;
            }

            $dateStr  = $scheduleDate->format('Y-m-d');
            $slotKey  = $dateStr . '_' . $schedule->start_time;

            if ($existingSlots->has($slotKey)) {
                $slot = $existingSlots->get($slotKey);
                $calendar->push([
                    'date'             => $dateStr,
                    'location_id'      => $locationId,
                    'location'         => $location->name_en,
                    'experience_id'    => $experienceId,
                    'experience_price' => $experiencePrice,
                    'start_time'       => $slot->start_time,
                    'end_time'         => $slot->end_time,
                    'total_slots'      => $slot->total_slots,
                    'booked_slots'     => $slot->booked_slots,
                    'available_slots'  => $slot->remaining,
                    'is_available'     => $slot->is_available,
                    'slot_id'          => $slot->id,
                ]);
            } else {
                $calendar->push([
                    'date'             => $dateStr,
                    'location_id'      => $locationId,
                    'location'         => $location->name_en,
                    'experience_id'    => $experienceId,
                    'experience_price' => $experiencePrice,
                    'start_time'       => $schedule->start_time,
                    'end_time'         => $schedule->end_time,
                    'total_slots'      => 12,
                    'booked_slots'     => 0,
                    'available_slots'  => 12,
                    'is_available'     => true,
                    'slot_id'          => null,
                ]);
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
        $dayOfWeek  = $carbonDate->dayOfWeek;

        // 1. Check explicit AvailabilitySlot rows first
        $explicitSlots = AvailabilitySlot::forLocation($locationId)
            ->forDate($date)
            ->get();

        if ($explicitSlots->isNotEmpty()) {
            return $explicitSlots->map(function ($slot) use ($locationId) {
                return [
                    'slot_id'         => $slot->id,
                    'location_id'     => $locationId,
                    'date'            => $slot->date->format('Y-m-d'),
                    'start_time'      => $slot->start_time,
                    'end_time'        => $slot->end_time,
                    'total_slots'     => $slot->total_slots,
                    'available_slots' => $slot->remaining,
                    'is_available'    => $slot->is_available,
                ];
            });
        }

        // 2. Check custom-date schedules matching this exact date
        $customSchedules = Schedule::where('location_id', $locationId)
            ->whereNotNull('date')
            ->whereNull('day_of_week')
            ->where('date', $date)
            ->where('is_active', true)
            ->get();

        if ($customSchedules->isNotEmpty()) {
            return $customSchedules->map(function ($schedule) use ($locationId, $date) {
                return [
                    'slot_id'         => null,
                    'location_id'     => $locationId,
                    'date'            => $date,
                    'start_time'      => $schedule->start_time,
                    'end_time'        => $schedule->end_time,
                    'total_slots'     => 12,
                    'available_slots' => 12,
                    'is_available'    => true,
                ];
            });
        }

        // 3. Fall back to weekly schedule (only for weekly-type locations)
        $schedules = Schedule::where('location_id', $locationId)
            ->where('day_of_week', $dayOfWeek)
            ->whereNull('date')
            ->where('is_active', true)
            ->get();

        return $schedules->map(function ($schedule) use ($locationId, $date) {
            return [
                'slot_id'         => null,
                'location_id'     => $locationId,
                'date'            => $date,
                'start_time'      => $schedule->start_time,
                'end_time'        => $schedule->end_time,
                'total_slots'     => 12,
                'available_slots' => 12,
                'is_available'    => true,
            ];
        });
    }
}
