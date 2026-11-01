<?php

namespace Tests\Feature;

use App\Models\ExperienceCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RangeAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_one_time_event_range_and_calendar_exposes_it_on_its_start_date(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $category = ExperienceCategory::create([
            'name_en' => 'Events',
            'name_es' => 'Eventos',
            'slug' => 'events',
            'sort_order' => 0,
            'is_active' => true,
        ]);
        $startDate = now()->addDays(10)->toDateString();
        $endDate = Carbon::parse($startDate)->addDays(6)->toDateString();

        $response = $this->postJson('/api/admin/locations', [
            'name_en' => 'Multi-day Paella Event',
            'name_es' => 'Evento de paella',
            'category_id' => $category->id,
            'availability_type' => 'range',
            'schedules' => json_encode([[
                'date' => $startDate,
                'end_date' => $endDate,
                'start_time' => '21:00',
                'end_time' => '00:00',
                'total_slots' => 12,
            ]]),
            'subtitle_en' => 'Paella Event',
            'price' => 99,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('availability_type', 'range')
            ->assertJsonPath('schedules.0.date', $startDate)
            ->assertJsonPath('schedules.0.end_date', $endDate);

        $this->getJson('/api/locations?lang=en')
            ->assertOk()
            ->assertJsonPath('data.0.availability_type', 'range')
            ->assertJsonPath('data.0.schedules.0.end_date', $endDate);

        $this->getJson('/api/calendar?'.http_build_query([
            'location_id' => $response->json('id'),
            'year' => Carbon::parse($startDate)->year,
            'month' => Carbon::parse($startDate)->month,
        ]))
            ->assertOk()
            ->assertJsonPath('data.events.0.date', $startDate)
            ->assertJsonPath('data.events.0.end_date', $endDate)
            ->assertJsonPath('data.events.0.start_time', '21:00')
            ->assertJsonPath('data.events.0.end_time', '00:00');

        $this->getJson('/api/availability?'.http_build_query([
            'location_id' => $response->json('id'),
            'date' => $endDate,
        ]))
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_range_event_must_end_after_its_start(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $category = ExperienceCategory::create([
            'name_en' => 'Events',
            'name_es' => 'Eventos',
            'slug' => 'events',
            'sort_order' => 0,
            'is_active' => true,
        ]);

        $this->postJson('/api/admin/locations', [
            'name_en' => 'Invalid Event',
            'category_id' => $category->id,
            'availability_type' => 'range',
            'schedules' => json_encode([[
                'date' => '2026-01-25',
                'end_date' => '2026-01-25',
                'start_time' => '21:00',
                'end_time' => '00:00',
                'total_slots' => 12,
            ]]),
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['schedules.0.end_date']);

        $this->assertDatabaseMissing('locations', ['name_en' => 'Invalid Event']);
    }
}
