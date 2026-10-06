<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_es')->nullable();
            $table->string('slug')->unique();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $now = now();
        $categories = [
            ['name_en' => 'Paella & Food', 'name_es' => 'Paella y cocina', 'slug' => 'paella-and-food', 'sort_order' => 0],
            ['name_en' => 'People & Moments', 'name_es' => 'Personas y momentos', 'slug' => 'people-and-moments', 'sort_order' => 1],
            ['name_en' => 'Places & Atmosphere', 'name_es' => 'Lugares y ambiente', 'slug' => 'places-and-atmosphere', 'sort_order' => 2],
            ['name_en' => 'The Experience', 'name_es' => 'La experiencia', 'slug' => 'the-experience', 'sort_order' => 3],
        ];

        foreach ($categories as &$category) {
            $category['is_active'] = true;
            $category['created_at'] = $now;
            $category['updated_at'] = $now;
            $category['id'] = DB::table('gallery_categories')->insertGetId($category);
        }
        unset($category);

        Schema::table('galleries', function (Blueprint $table) {
            $table->foreignId('category_id')
                ->nullable()
                ->after('type')
                ->constrained('gallery_categories')
                ->nullOnDelete();
        });

        $rows = DB::table('galleries')->select('id', 'type', 'alt_en')->get();
        foreach ($rows as $row) {
            $alt = strtolower($row->alt_en ?? '');
            if (preg_match('/paella|socarrat|cooking|rice|chef/', $alt)) {
                $categorySlug = 'paella-and-food';
            } elseif (preg_match('/guest|sharing|gathering|stories|friends|people/', $alt)) {
                $categorySlug = 'people-and-moments';
            } elseif (preg_match('/venue|atmosphere|place|underground/', $alt) || $row->type === 'location') {
                $categorySlug = 'places-and-atmosphere';
            } else {
                $categorySlug = 'the-experience';
            }

            $category = collect($categories)->firstWhere('slug', $categorySlug);
            DB::table('galleries')->where('id', $row->id)->update(['category_id' => $category['id']]);
        }
    }

    public function down(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });

        Schema::dropIfExists('gallery_categories');
    }
};
