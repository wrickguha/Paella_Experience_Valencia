<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('language_preference', ['spanish', 'english', 'both'])->nullable()->after('payment_id');
            $table->text('notes')->nullable()->after('language_preference');
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending')->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['language_preference', 'notes', 'status']);
        });
    }
};
