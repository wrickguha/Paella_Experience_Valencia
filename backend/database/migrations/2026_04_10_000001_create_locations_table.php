<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_es');
            $table->text('description_en');
            $table->text('description_es');
            $table->string('address');
            $table->string('image')->nullable();
            $table->enum('availability_type', ['weekly', 'custom'])->default('weekly');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
