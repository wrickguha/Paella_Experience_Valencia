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

        // Bloom Gallery — Saturdays only (6 = Saturday)
        Schedule::create([
            'location_id' => $bloom->id,
            'day_of_week' => 6,
            'start_time' => '12:00',
            'end_time' => '16:00',
        ]);

        // Casa Magnolia — Sunday through Friday (0-5)
        foreach ([0, 1, 2, 3, 4, 5] as $day) {
            Schedule::create([
                'location_id' => $magnolia->id,
                'day_of_week' => $day,
                'start_time' => '13:00',
                'end_time' => '17:00',
            ]);
        }
    }
}
