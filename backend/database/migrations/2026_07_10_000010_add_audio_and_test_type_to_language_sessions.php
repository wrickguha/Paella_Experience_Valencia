<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('language_sessions', function (Blueprint $table) {
            $table->enum('test_type', ['session', 'level_test'])->default('session')->after('sort_order');
            $table->string('audio_url')->nullable()->after('test_type');
        });
    }

    public function down(): void
    {
        Schema::table('language_sessions', function (Blueprint $table) {
            $table->dropColumn(['test_type', 'audio_url']);
        });
    }
};
