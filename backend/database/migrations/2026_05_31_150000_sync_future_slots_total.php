<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $today = Carbon::today()->toDateString();
        $slots = DB::table('availability_slots')
            ->where('date', '>=', $today)
            ->get();

        foreach ($slots as $slot) {
            $slotDate = Carbon::parse($slot->date);
            $dayOfWeek = $slotDate->dayOfWeek;

            // Find matching active schedule
            $schedule = DB::table('schedules')
                ->where('location_id', $slot->location_id)
                ->where('start_time', $slot->start_time)
                ->where('is_active', 1)
                ->where(function ($query) use ($dayOfWeek, $slot) {
                    $query->where(function ($q) use ($dayOfWeek) {
                        $q->where('day_of_week', $dayOfWeek)
                          ->whereNull('date');
                    })->orWhere('date', $slot->date);
                })
                ->first();

            if ($schedule) {
                DB::table('availability_slots')
                    ->where('id', $slot->id)
                    ->update(['total_slots' => $schedule->total_slots]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down action needed
    }
};
