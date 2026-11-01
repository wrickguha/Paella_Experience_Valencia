<?php

namespace App\Mail;

use App\Models\ContactMessage;
use App\Services\EmailTemplateService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewContactMessageAdminNotification extends Mailable
{
    use Queueable, SerializesModels;

    public ContactMessage $contactMessage;

    public function __construct(ContactMessage $contactMessage)
    {
        $this->contactMessage = $contactMessage;
    }

    public function build()
    {
        $templateService = app(EmailTemplateService::class);
        $data = ['contactMessage' => $this->contactMessage];
        $this->subject($templateService->subject(
            'new_contact_message_admin_notification',
            'New Contact Message: '.$this->contactMessage->subject,
            $data
        ));

        $body = $templateService->body('new_contact_message_admin_notification', $data);
        if ($body !== null) {
            return $this->html($body);
        }

        return $this->view('emails.new_contact_message_admin_notification')->with($data);
    }
}
