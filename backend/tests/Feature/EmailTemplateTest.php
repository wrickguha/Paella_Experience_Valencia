<?php

namespace Tests\Feature;

use App\Mail\NewLevelTestAdminNotification;
use App\Models\EmailTemplate;
use App\Models\User;
use App\Services\EmailTemplateService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailTemplateTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
    }

    public function test_admin_can_create_update_and_delete_a_draft_template(): void
    {
        Sanctum::actingAs($this->admin);

        $created = $this->postJson('/api/admin/email-templates', [
            'key' => 'follow-up',
            'name' => 'Follow-up',
            'subject' => 'Thanks for visiting',
            'body_text' => 'We hope to see you again.',
        ])->assertCreated()
            ->assertJsonPath('is_system', false)
            ->assertJsonPath('is_active', false)
            ->assertJsonPath('body_text', 'We hope to see you again.')
            ->assertJsonMissingPath('body_html');

        $id = $created->json('id');

        $this->putJson("/api/admin/email-templates/{$id}", [
            'key' => 'follow-up',
            'name' => 'Updated follow-up',
            'subject' => 'A note from SpeakEasy',
            'body_text' => 'Come back soon.',
        ])->assertOk()
            ->assertJsonPath('name', 'Updated follow-up');

        $this->deleteJson("/api/admin/email-templates/{$id}")
            ->assertOk();

        $this->assertDatabaseMissing('email_templates', ['id' => $id]);
    }

    public function test_built_in_templates_can_be_edited_and_paused_but_not_deleted(): void
    {
        Sanctum::actingAs($this->admin);
        $template = EmailTemplate::where('key', 'booking_confirmation')->firstOrFail();

        $this->putJson("/api/admin/email-templates/{$template->id}", [
            'key' => $template->key,
            'name' => $template->name,
            'subject' => 'Your booking is ready',
            'body_text' => null,
            'is_active' => false,
        ])->assertOk()
            ->assertJsonPath('is_active', false);

        $this->deleteJson("/api/admin/email-templates/{$template->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('email_templates', [
            'id' => $template->id,
            'subject' => 'Your booking is ready',
            'is_active' => false,
        ]);
    }

    public function test_email_template_endpoints_require_admin_authentication(): void
    {
        $this->getJson('/api/admin/email-templates')->assertUnauthorized();
    }

    public function test_admin_can_preview_the_built_in_email_design(): void
    {
        Sanctum::actingAs($this->admin);
        $template = EmailTemplate::where('key', 'booking_confirmation')->firstOrFail();

        $this->get("/api/admin/email-templates/{$template->id}/preview")
            ->assertOk()
            ->assertSee('Booking Confirmed!')
            ->assertSee('Alex')
            ->assertSee('PEV-2026-001');
    }

    public function test_preview_uses_plain_text_inside_the_existing_email_design(): void
    {
        Sanctum::actingAs($this->admin);
        $template = EmailTemplate::where('key', 'booking_confirmation')->firstOrFail();

        $this->get("/api/admin/email-templates/{$template->id}/preview?body_text=".urlencode("Hello {{ booking.first_name }}\nThanks!"))
            ->assertOk()
            ->assertSee('Booking Confirmed!')
            ->assertSee('Hello Alex')
            ->assertSee('Thanks!')
            ->assertSee('PEV-2026-001')
            ->assertDontSee('<img');
    }

    public function test_template_variables_are_replaced_in_plain_text(): void
    {
        $template = EmailTemplate::where('key', 'booking_confirmation')->firstOrFail();
        $template->update([
            'subject' => 'Booking {{ booking.reference }}',
            'body_text' => 'Hello {{ booking.first_name }}',
        ]);

        $renderer = app(EmailTemplateService::class);
        $data = [
            'booking' => [
                'reference' => 'PEV-123',
                'first_name' => '<img src=x onerror=alert(1)>',
            ],
        ];

        $this->assertSame('Booking PEV-123', $renderer->subject('booking_confirmation', 'Fallback', $data));
        $this->assertSame(
            'Hello <img src=x onerror=alert(1)>',
            $renderer->bodyText('booking_confirmation', $data)
        );
    }

    public function test_mailable_uses_the_saved_template_content(): void
    {
        EmailTemplate::where('key', 'new_level_test_admin_notification')->update([
            'subject' => 'New request from {{ name }}',
            'body_text' => 'Language: {{ language_type }}',
        ]);

        $mail = new NewLevelTestAdminNotification([
            'name' => 'Alex',
            'email' => 'alex@example.com',
            'language_type' => 'Spanish',
        ]);

        $rendered = $mail->render();
        $this->assertStringContainsString('Language: Spanish', $rendered);
        $this->assertStringContainsString('New Level Test Request!', $rendered);
        $this->assertSame('New request from Alex', $mail->subject);
    }

    public function test_mailable_escapes_html_in_text_content(): void
    {
        EmailTemplate::where('key', 'new_level_test_admin_notification')->update([
            'body_text' => 'Message from {{ name }}',
        ]);

        $mail = new NewLevelTestAdminNotification([
            'name' => '<img src=x onerror=alert(1)>',
            'email' => 'alex@example.com',
            'language_type' => 'Spanish',
        ]);

        $rendered = $mail->render();
        $this->assertStringContainsString('Message from &lt;img src=x onerror=alert(1)&gt;', $rendered);
        $this->assertStringNotContainsString('<img src=x', $rendered);
    }
}
