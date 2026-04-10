<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('payment_method')->default('paypal');
            $table->string('transaction_id')->nullable();
            $table->string('paypal_order_id')->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['created', 'approved', 'completed', 'failed', 'refunded'])->default('created');
            $table->json('response_json')->nullable();
            $table->timestamps();

            $table->index('transaction_id');
            $table->index('paypal_order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
