<?php

namespace Tests\Feature;

use App\Models\ExperienceCategory;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExperienceCategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_categories_and_the_public_api_returns_localized_names(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $response = $this->postJson('/api/admin/experience-categories', [
            'name_en' => 'Family Cooking',
            'name_es' => 'Cocina familiar',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.slug', 'family-cooking');

        $this->postJson('/api/admin/locations', [
            'name_en' => 'Family Kitchen',
            'name_es' => 'Cocina familiar',
            'description_en' => '',
            'description_es' => '',
            'address' => '',
            'category_id' => $response->json('data.id'),
        ])
            ->assertCreated()
            ->assertJsonPath('category_id', $response->json('data.id'));

        $this->getJson('/api/experience-categories?lang=es')
            ->assertOk()
            ->assertJsonFragment([
                'slug' => 'family-cooking',
                'name' => 'Cocina familiar',
            ]);
    }

    public function test_category_with_locations_cannot_be_deleted(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');

        $category = ExperienceCategory::create([
            'name_en' => 'Family Cooking',
            'name_es' => 'Cocina familiar',
            'slug' => 'family-cooking',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        Location::create([
            'name_en' => 'Test location',
            'name_es' => 'Lugar de prueba',
            'description_en' => '',
            'description_es' => '',
            'address' => '',
            'availability_type' => 'weekly',
            'category' => 'city',
            'category_id' => $category->id,
            'is_active' => true,
        ]);

        $this->deleteJson("/api/admin/experience-categories/{$category->id}")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Reassign this category’s locations before deleting the category.');

        $this->assertDatabaseHas('experience_categories', ['id' => $category->id]);
    }
}
