<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('language_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('title_en');
            $table->string('title_es');
            $table->text('description_en')->nullable();
            $table->text('description_es')->nullable();
            $table->enum('language_type', ['spanish', 'english', 'both'])->default('both');
            $table->enum('skill_level', ['beginner', 'intermediate', 'advanced'])->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('language_sessions');
    }
};
