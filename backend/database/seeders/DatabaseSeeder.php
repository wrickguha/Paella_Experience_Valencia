<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Order matters: locations first, then dependents
        $this->call([
            LocationSeeder::class,
            ScheduleSeeder::class,
            ExperienceSeeder::class,
            AvailabilitySeeder::class,
            GallerySeeder::class,
            TestimonialSeeder::class,
            FaqSeeder::class,
            SettingSeeder::class,
        ]);
    }
}
