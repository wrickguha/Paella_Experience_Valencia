<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('subject');
            $table->longText('body_html')->nullable();
            $table->json('available_variables');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });

        $now = now();
        DB::table('email_templates')->insert([
            [
                'key' => 'booking_confirmation',
                'name' => 'Booking confirmation',
                'subject' => 'Your Booking Confirmation - SpeakEasy Valencia',
                'body_html' => null,
                'available_variables' => json_encode([
                    '{{ booking.first_name }}', '{{ booking.last_name }}', '{{ booking.email }}',
                    '{{ booking.reference }}', '{{ booking.location.name_en }}', '{{ booking.experience.title_en }}',
                    '{{ booking.date }}', '{{ booking.time }}', '{{ booking.guests }}', '{{ booking.total_price }}',
                    '{{ booking.coupon_code }}', '{{ booking.discount_percent }}',
                ]),
                'is_active' => true,
                'is_system' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'new_booking_admin_notification',
                'name' => 'New booking notification (admin)',
                'subject' => 'New Booking Received - {{ booking.reference }}',
                'body_html' => null,
                'available_variables' => json_encode([
                    '{{ booking.first_name }}', '{{ booking.last_name }}', '{{ booking.email }}', '{{ booking.phone }}',
                    '{{ booking.reference }}', '{{ booking.location.name_en }}', '{{ booking.experience.title_en }}',
                    '{{ booking.date }}', '{{ booking.time }}', '{{ booking.guests }}', '{{ booking.total_price }}',
                    '{{ booking.language_preference }}', '{{ booking.coupon_code }}', '{{ booking.discount_percent }}',
                    '{{ booking.notes }}',
                ]),
                'is_active' => true,
                'is_system' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'new_contact_message_admin_notification',
                'name' => 'Contact message notification (admin)',
                'subject' => 'New Contact Message: {{ contactMessage.subject }}',
                'body_html' => null,
                'available_variables' => json_encode([
                    '{{ contactMessage.name }}', '{{ contactMessage.email }}',
                    '{{ contactMessage.subject }}', '{{ contactMessage.message }}',
                ]),
                'is_active' => true,
                'is_system' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'new_level_test_admin_notification',
                'name' => 'Level test request notification (admin)',
                'subject' => 'New Level Test Request: {{ name }}',
                'body_html' => null,
                'available_variables' => json_encode([
                    '{{ name }}', '{{ email }}', '{{ language_type }}', '{{ skill_level }}', '{{ audio_url }}',
                ]),
                'is_active' => true,
                'is_system' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
