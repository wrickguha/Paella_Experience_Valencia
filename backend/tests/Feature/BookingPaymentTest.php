<?php

namespace Tests\Feature;

use App\Models\AvailabilitySlot;
use App\Models\Booking;
use App\Models\Experience;
use App\Models\Location;
use App\Models\Payment;
use App\Models\User;
use App\Services\PayPalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingPaymentTest extends TestCase
{
    use RefreshDatabase;

    private Location $location;
    private Experience $experience;
    private AvailabilitySlot $slot;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->location = Location::create([
            'name_en' => 'Test Location',
            'name_es' => 'Test Location ES',
            'description_en' => 'Desc',
            'description_es' => 'Desc ES',
            'address' => 'Test Address',
            'is_active' => true,
        ]);

        $this->experience = Experience::create([
            'location_id' => $this->location->id,
            'title_en' => 'Test Experience',
            'title_es' => 'Test Experience ES',
            'description_en' => 'Desc',
            'description_es' => 'Desc ES',
            'price' => 50.00,
            'duration' => '2 hours',
            'is_active' => true,
        ]);

        $this->slot = AvailabilitySlot::create([
            'location_id' => $this->location->id,
            'date' => '2026-06-05',
            'start_time' => '20:00:00',
            'end_time' => '22:00:00',
            'total_slots' => 10,
            'booked_slots' => 0,
        ]);

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
    }

    public function test_booking_status_changes_to_confirmed_when_payment_status_becomes_paid()
    {
        $booking = Booking::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'location_id' => $this->location->id,
            'experience_id' => $this->experience->id,
            'availability_slot_id' => $this->slot->id,
            'date' => '2026-06-05',
            'time' => '20:00:00',
            'guests' => 2,
            'total_price' => 100.00,
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);

        $booking->update(['payment_status' => 'paid']);

        $booking->refresh();
        $this->assertEquals('paid', $booking->payment_status);
        $this->assertEquals('confirmed', $booking->status);

        // Verify slot's booked slots updated
        $this->slot->refresh();
        $this->assertEquals(2, $this->slot->booked_slots);
    }

    public function test_paypal_service_capture_updates_booking_status_to_confirmed()
    {
        // Mock PayPal OAuth and Capture API calls
        Http::fake([
            '*/v1/oauth2/token' => Http::response(['access_token' => 'mock-token']),
            '*/v2/checkout/orders/*/capture' => Http::response([
                'status' => 'COMPLETED',
                'purchase_units' => [
                    [
                        'payments' => [
                            'captures' => [
                                [
                                    'id' => 'CAPTURE_ID_123'
                                ]
                            ]
                        ]
                    ]
                ]
            ]),
        ]);

        $booking = Booking::create([
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'location_id' => $this->location->id,
            'experience_id' => $this->experience->id,
            'availability_slot_id' => $this->slot->id,
            'date' => '2026-06-05',
            'time' => '20:00:00',
            'guests' => 3,
            'total_price' => 150.00,
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'paypal',
            'paypal_order_id' => 'ORDER_ID_123',
            'amount' => 150.00,
            'status' => 'created',
        ]);

        // Configure mock configs for PayPalService
        config([
            'services.paypal.client_id' => 'mock-client-id',
            'services.paypal.client_secret' => 'mock-secret',
            'services.paypal.mode' => 'sandbox',
        ]);

        $payPalService = new PayPalService();
        $result = $payPalService->captureOrder('ORDER_ID_123');

        $this->assertTrue($result['success']);

        $booking->refresh();
        $this->assertEquals('paid', $booking->payment_status);
        $this->assertEquals('confirmed', $booking->status);
        $this->assertEquals('CAPTURE_ID_123', $booking->payment_id);

        $this->slot->refresh();
        $this->assertEquals(3, $this->slot->booked_slots);
    }

    public function test_artisan_command_clears_pending_bookings_older_than_24_hours()
    {
        $oldPendingBooking = Booking::create([
            'first_name' => 'Old',
            'last_name' => 'Pending',
            'email' => 'old_pending@example.com',
            'location_id' => $this->location->id,
            'experience_id' => $this->experience->id,
            'availability_slot_id' => $this->slot->id,
            'date' => '2026-06-05',
            'time' => '20:00:00',
            'guests' => 2,
            'total_price' => 100.00,
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);
        $oldPendingBooking->created_at = now()->subHours(25);
        $oldPendingBooking->save();

        $newPendingBooking = Booking::create([
            'first_name' => 'New',
            'last_name' => 'Pending',
            'email' => 'new_pending@example.com',
            'location_id' => $this->location->id,
            'experience_id' => $this->experience->id,
            'availability_slot_id' => $this->slot->id,
            'date' => '2026-06-05',
            'time' => '20:00:00',
            'guests' => 1,
            'total_price' => 50.00,
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);
        $newPendingBooking->created_at = now()->subHours(10);
        $newPendingBooking->save();

        $oldPaidBooking = Booking::create([
            'first_name' => 'Old',
            'last_name' => 'Paid',
            'email' => 'old_paid@example.com',
            'location_id' => $this->location->id,
            'experience_id' => $this->experience->id,
            'availability_slot_id' => $this->slot->id,
            'date' => '2026-06-05',
            'time' => '20:00:00',
            'guests' => 1,
            'total_price' => 50.00,
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);
        $oldPaidBooking->created_at = now()->subHours(30);
        $oldPaidBooking->save();

        $this->artisan('bookings:clear-pending')
            ->expectsOutput('Cleared 1 pending bookings older than 24 hours.')
            ->assertExitCode(0);

        $this->assertDatabaseMissing('bookings', ['id' => $oldPendingBooking->id]);
        $this->assertDatabaseHas('bookings', ['id' => $newPendingBooking->id]);
        $this->assertDatabaseHas('bookings', ['id' => $oldPaidBooking->id]);
    }

    public function test_admin_booking_index_controller_dynamically_clears_expired_pending_bookings()
    {
        $oldPendingBooking = Booking::create([
            'first_name' => 'Old',
            'last_name' => 'Pending',
            'email' => 'old_pending@example.com',
            'location_id' => $this->location->id,
            'experience_id' => $this->experience->id,
            'availability_slot_id' => $this->slot->id,
            'date' => '2026-06-05',
            'time' => '20:00:00',
            'guests' => 2,
            'total_price' => 100.00,
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);
        $oldPendingBooking->created_at = now()->subHours(25);
        $oldPendingBooking->save();

        $newPendingBooking = Booking::create([
            'first_name' => 'New',
            'last_name' => 'Pending',
            'email' => 'new_pending@example.com',
            'location_id' => $this->location->id,
            'experience_id' => $this->experience->id,
            'availability_slot_id' => $this->slot->id,
            'date' => '2026-06-05',
            'time' => '20:00:00',
            'guests' => 1,
            'total_price' => 50.00,
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);
        $newPendingBooking->created_at = now()->subHours(10);
        $newPendingBooking->save();

        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/admin/bookings');

        $response->assertStatus(200);

        // Assert database states - the old one should be dynamically deleted
        $this->assertDatabaseMissing('bookings', ['id' => $oldPendingBooking->id]);
        $this->assertDatabaseHas('bookings', ['id' => $newPendingBooking->id]);
    }
}
