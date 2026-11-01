<?php

namespace App\Mail;

use App\Models\Booking;
use App\Services\EmailTemplateService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewBookingAdminNotification extends Mailable
{
    use Queueable, SerializesModels;

    public Booking $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function build()
    {
        $templateService = app(EmailTemplateService::class);
        $data = ['booking' => $this->booking];
        $this->subject($templateService->subject(
            'new_booking_admin_notification',
            'New Booking Received - '.$this->booking->reference,
            $data
        ));

        $body = $templateService->body('new_booking_admin_notification', $data);
        if ($body !== null) {
            return $this->html($body);
        }

        return $this->view('emails.new_booking_admin_notification')->with($data);
    }
}
