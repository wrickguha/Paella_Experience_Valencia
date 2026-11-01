<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->string('availability_type', 20)->default('weekly')->change();
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->tinyInteger('day_of_week')->nullable()->default(null)->change();
            $table->date('end_date')->nullable()->after('date');
        });
    }

    public function down(): void
    {
        DB::table('locations')
            ->where('availability_type', 'range')
            ->update(['availability_type' => 'custom']);

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn('end_date');
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->enum('availability_type', ['weekly', 'custom'])->default('weekly')->change();
        });
    }
};
