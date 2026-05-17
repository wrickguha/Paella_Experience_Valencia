<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add date column only if it doesn't exist yet (migration may have
        // partially run before and been rolled back to this point)
        if (!Schema::hasColumn('schedules', 'date')) {
            Schema::table('schedules', function (Blueprint $table) {
                $table->date('date')->nullable()->after('location_id');
            });
        }

        // Make day_of_week nullable (raw SQL avoids doctrine/dbal dependency)
        DB::statement('ALTER TABLE schedules MODIFY COLUMN day_of_week TINYINT NULL DEFAULT NULL');

        // Drop the old unique constraint that assumed day_of_week is always set.
        // First add a plain index on location_id so MySQL still has a backing
        // index for the FK after the unique index is removed.
        // Use IF NOT EXISTS / IF EXISTS to be idempotent.
        DB::statement('ALTER TABLE schedules ADD INDEX IF NOT EXISTS schedules_location_id_idx (location_id)');
        DB::statement('ALTER TABLE schedules DROP INDEX IF EXISTS schedules_location_id_day_of_week_start_time_unique');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE schedules MODIFY COLUMN day_of_week TINYINT NOT NULL');

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn('date');
            $table->unique(['location_id', 'day_of_week', 'start_time']);
        });
    }
};
