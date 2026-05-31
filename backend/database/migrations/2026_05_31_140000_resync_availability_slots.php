<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $slots = DB::table('availability_slots')->get();

        foreach ($slots as $slot) {
            $realBooked = DB::table('bookings')
                ->where('availability_slot_id', $slot->id)
                ->where('payment_status', 'paid')
                ->where('status', '!=', 'cancelled')
                ->sum('guests');

            DB::table('availability_slots')
                ->where('id', $slot->id)
                ->update(['booked_slots' => $realBooked]);
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
