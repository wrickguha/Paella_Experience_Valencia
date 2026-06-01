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
        // Update all bookings where payment_status = 'paid' and status is not 'confirmed' or 'cancelled'
        DB::table('bookings')
            ->where('payment_status', 'paid')
            ->where(function ($query) {
                $query->whereNull('status')
                      ->orWhereNotIn('status', ['confirmed', 'cancelled']);
            })
            ->update(['status' => 'confirmed']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Down migration not strictly necessary as this is a one-time data correction
    }
};
