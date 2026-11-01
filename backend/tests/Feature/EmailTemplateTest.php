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
            'body_html' => '<p>We hope to see you again.</p>',
        ])->assertCreated()
            ->assertJsonPath('is_system', false)
            ->assertJsonPath('is_active', false);

        $id = $created->json('id');

        $this->putJson("/api/admin/email-templates/{$id}", [
            'key' => 'follow-up',
            'name' => 'Updated follow-up',
            'subject' => 'A note from SpeakEasy',
            'body_html' => '<p>Come back soon.</p>',
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
            'body_html' => null,
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

    public function test_template_variables_are_replaced_and_html_escaped(): void
    {
        $template = EmailTemplate::where('key', 'booking_confirmation')->firstOrFail();
        $template->update([
            'subject' => 'Booking {{ booking.reference }}',
            'body_html' => '<p>Hello {{ booking.first_name }}</p>',
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
            '<p>Hello &lt;img src=x onerror=alert(1)&gt;</p>',
            $renderer->body('booking_confirmation', $data)
        );
    }

    public function test_mailable_uses_the_saved_template_content(): void
    {
        EmailTemplate::where('key', 'new_level_test_admin_notification')->update([
            'subject' => 'New request from {{ name }}',
            'body_html' => '<p>Language: {{ language_type }}</p>',
        ]);

        $mail = new NewLevelTestAdminNotification([
            'name' => 'Alex',
            'email' => 'alex@example.com',
            'language_type' => 'Spanish',
        ]);

        $this->assertStringContainsString('<p>Language: Spanish</p>', $mail->render());
        $this->assertSame('New request from Alex', $mail->subject);
    }
}
