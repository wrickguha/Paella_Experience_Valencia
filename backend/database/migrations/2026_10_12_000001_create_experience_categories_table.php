<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experience_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_es')->nullable();
            $table->string('slug')->unique();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $now = now();
        DB::table('experience_categories')->insert([
            ['name_en' => 'City', 'name_es' => 'Ciudad', 'slug' => 'city', 'sort_order' => 0, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name_en' => 'Countryside', 'name_es' => 'Campo', 'slug' => 'countryside', 'sort_order' => 1, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        Schema::table('locations', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('category')->constrained('experience_categories')->nullOnDelete();
        });

        foreach (['city', 'countryside'] as $slug) {
            $categoryId = DB::table('experience_categories')->where('slug', $slug)->value('id');
            DB::table('locations')->where('category', $slug)->update(['category_id' => $categoryId]);
        }
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });

        Schema::dropIfExists('experience_categories');
    }
};
