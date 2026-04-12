<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('about_sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_key');          // hero, story, mission, locations, team, gallery, cta
            $table->string('title_en')->nullable();
            $table->string('title_es')->nullable();
            $table->text('content_en')->nullable();
            $table->text('content_es')->nullable();
            $table->string('subtitle_en')->nullable();
            $table->string('subtitle_es')->nullable();
            $table->string('image')->nullable();
            $table->string('cta_text_en')->nullable();
            $table->string('cta_text_es')->nullable();
            $table->string('cta_link')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('about_sections');
    }
};
