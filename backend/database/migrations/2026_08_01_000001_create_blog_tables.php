<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('blog_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_es')->nullable();
            $table->string('slug')->unique();
            $table->text('description_en')->nullable();
            $table->text('description_es')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('blog_categories')->nullOnDelete();
            $table->string('title_en');
            $table->string('title_es')->nullable();
            $table->string('slug')->unique();
            $table->text('excerpt_en')->nullable();
            $table->text('excerpt_es')->nullable();
            $table->longText('content_en');
            $table->longText('content_es')->nullable();
            $table->string('featured_image')->nullable();
            $table->string('author_name')->default('SpeakEasy Valencia');
            $table->string('author_avatar')->nullable();
            $table->string('author_role')->default('Culinary & Culture Host');
            $table->string('reading_time')->default('5 min read');
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_published')->default(true)->index();
            $table->dateTime('published_at')->nullable()->index();
            $table->unsignedInteger('views_count')->default(0);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('blog_categories');
    }
};
