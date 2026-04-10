<?php

namespace Database\Seeders;

use App\Models\AvailabilitySlot;
use App\Models\Location;
use App\Models\Schedule;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Database\Seeder;

class AvailabilitySeeder extends Seeder
{
    /**
     * Pre-generate availability_slots for the next 3 months
     * based on weekly schedules.
     */
    public function run(): void
    {
        $locations = Location::with('schedules')->get();
        $start = Carbon::today();
        $end = $start->copy()->addMonths(3);
        $period = CarbonPeriod::create($start, $end);

        foreach ($locations as $location) {
            $activeSchedules = $location->schedules->where('is_active', true);

            foreach ($period as $date) {
                $dayOfWeek = $date->dayOfWeek;

                foreach ($activeSchedules->where('day_of_week', $dayOfWeek) as $schedule) {
                    $spotsLeft = rand(4, 12); // Simulate varying availability

                    AvailabilitySlot::create([
                        'location_id' => $location->id,
                        'date' => $date->format('Y-m-d'),
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                        'total_slots' => 12,
                        'booked_slots' => 12 - $spotsLeft,
                    ]);
                }
            }
        }
    }
}
