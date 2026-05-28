<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('coupon_code')->nullable()->after('notes');
            $table->decimal('discount_percent', 5, 2)->nullable()->after('coupon_code');
            $table->decimal('discount_amount', 10, 2)->nullable()->after('discount_percent');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['coupon_code', 'discount_percent', 'discount_amount']);
        });
    }
};
