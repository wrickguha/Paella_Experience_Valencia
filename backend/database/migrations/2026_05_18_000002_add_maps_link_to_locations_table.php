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
            $table->string('maps_link', 1000)->nullable()->after('address');
        });

        // Make address nullable (no longer required in the UI)
        DB::statement('ALTER TABLE locations MODIFY COLUMN address VARCHAR(500) NULL DEFAULT NULL');
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn('maps_link');
        });

        DB::statement('ALTER TABLE locations MODIFY COLUMN address VARCHAR(500) NOT NULL');
    }
};
