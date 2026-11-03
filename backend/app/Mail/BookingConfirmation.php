<?php

namespace App\Mail;

use App\Models\Booking;
use App\Services\EmailTemplateService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingConfirmation extends Mailable
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
            'booking_confirmation',
            'Your Booking Confirmation - SpeakEasy Valencia',
            $data
        ));

        $data['emailBodyText'] = $templateService->bodyText('booking_confirmation', $data);

        return $this->view('emails.booking_confirmation')->with($data);
    }
}
