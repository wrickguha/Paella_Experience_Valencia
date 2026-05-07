<?php

namespace Database\Seeders;

use App\Models\Schedule;
use App\Models\Location;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $bloom = Location::where('name_en', 'Bloom Gallery')->first();
        $magnolia = Location::where('name_en', 'Casa Magnolia')->first();
        $speakeasy = Location::where('name_en', 'The Speakeasy')->first();

        // Bloom Gallery — Saturdays only (6 = Saturday)
        if ($bloom) {
            Schedule::firstOrCreate(
                ['location_id' => $bloom->id, 'day_of_week' => 6],
                ['start_time' => '12:00', 'end_time' => '16:00', 'is_active' => true]
            );
        }

        // Casa Magnolia — Sunday through Friday (0-5)
        if ($magnolia) {
            foreach ([0, 1, 2, 3, 4, 5] as $day) {
                Schedule::firstOrCreate(
                    ['location_id' => $magnolia->id, 'day_of_week' => $day],
                    ['start_time' => '13:00', 'end_time' => '17:00', 'is_active' => true]
                );
            }
        }

        // The Speakeasy — Friday & Saturday evenings (5 = Friday, 6 = Saturday)
        if ($speakeasy) {
            foreach ([5, 6] as $day) {
                Schedule::firstOrCreate(
                    ['location_id' => $speakeasy->id, 'day_of_week' => $day],
                    ['start_time' => '19:00', 'end_time' => '23:00', 'is_active' => true]
                );
            }
        }
    }
}
