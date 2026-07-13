<?php

namespace App\Mail;

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
        return $this->subject('New Level Test Request: ' . $this->data['name'])
            ->view('emails.new_level_test_admin_notification')
            ->with([
                'name' => $this->data['name'],
                'email' => $this->data['email'],
                'language_type' => $this->data['language_type'],
                'skill_level' => $this->data['skill_level'] ?? 'Not selected',
                'audio_url' => $this->data['audio_url'] ?? null,
            ]);
    }
}
