<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('availability_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedInteger('total_slots')->default(12);
            $table->unsignedInteger('booked_slots')->default(0);
            $table->boolean('is_blocked')->default(false);
            $table->timestamps();

            $table->unique(['location_id', 'date', 'start_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('availability_slots');
    }
};
