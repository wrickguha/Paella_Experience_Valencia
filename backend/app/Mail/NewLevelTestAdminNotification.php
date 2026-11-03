<?php

namespace App\Mail;

use App\Services\EmailTemplateService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewLevelTestAdminNotification extends Mailable
{
    use Queueable, SerializesModels;

    public array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function build()
    {
        $data = [
            'name' => $this->data['name'],
            'email' => $this->data['email'],
            'language_type' => $this->data['language_type'],
            'skill_level' => $this->data['skill_level'] ?? 'Not selected',
            'audio_url' => $this->data['audio_url'] ?? null,
        ];
        $templateService = app(EmailTemplateService::class);
        $this->subject($templateService->subject(
            'new_level_test_admin_notification',
            'New Level Test Request: '.$data['name'],
            $data
        ));

        $data['emailBodyText'] = $templateService->bodyText('new_level_test_admin_notification', $data);

        return $this->view('emails.new_level_test_admin_notification')->with($data);
    }
}
