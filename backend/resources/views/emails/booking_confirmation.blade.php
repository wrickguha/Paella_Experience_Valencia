<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Booking Confirmation</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 0; padding: 0; background-color: #f1f5f9; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0 16px;">
        <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0;">
            <!-- Header Banner -->
            <div style="background-color: #0f172a; padding: 36px 32px; text-align: center; position: relative; border-bottom: 4px solid #ea580c;">
                <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; letter-spacing: -0.02em;">Booking Confirmed!</h1>
                <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0 0; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">We are excited to welcome you</p>
            </div>

            <!-- Body Content -->
            <div style="padding: 32px 32px 40px 32px;">
                <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.01em;">Hi {{ $booking->first_name }},</h2>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #475569;">
                    Thank you for booking your reservation with <strong>SpeakEasy Valencia</strong>. We are thrilled to host you! Below is your official invitation and confirmation summary for the upcoming experience.
                </p>

                <!-- Booking Reference Chip -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 28px; text-align: center;">
                    <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600; display: block; margin-bottom: 6px;">Your Booking Reference</span>
                    <strong style="font-size: 24px; color: #ea580c; font-family: 'Courier New', Courier, monospace; letter-spacing: 1.5px;">{{ $booking->reference }}</strong>
                </div>

                <!-- Detail Table -->
                <h3 style="color: #0f172a; font-size: 16px; font-weight: 700; margin-top: 0; margin-bottom: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.02em;">Reservation Details</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px 0; color: #64748b; font-weight: 500; font-size: 14px;">Location</td>
                        <td style="padding: 12px 0; color: #0f172a; font-weight: 600; font-size: 14px; text-align: right;">{{ $booking->location->name_en }}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px 0; color: #64748b; font-weight: 500; font-size: 14px;">Date</td>
                        <td style="padding: 12px 0; color: #0f172a; font-weight: 600; font-size: 14px; text-align: right;">{{ $booking->date->format('F j, Y') }}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px 0; color: #64748b; font-weight: 500; font-size: 14px;">Time</td>
                        <td style="padding: 12px 0; color: #0f172a; font-weight: 600; font-size: 14px; text-align: right;">{{ $booking->time }}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px 0; color: #64748b; font-weight: 500; font-size: 14px;">Guests</td>
                        <td style="padding: 12px 0; color: #0f172a; font-weight: 600; font-size: 14px; text-align: right;">{{ $booking->guests }} {{ $booking->guests > 1 ? 'people' : 'person' }}</td>
                    </tr>
                    @if($booking->coupon_code)
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px 0; color: #64748b; font-weight: 500; font-size: 14px;">Coupon Discount</td>
                        <td style="padding: 12px 0; color: #16a34a; font-weight: 600; font-size: 14px; text-align: right;">{{ $booking->coupon_code }} ({{ $booking->discount_percent }}% off)</td>
                    </tr>
                    @endif
                    <tr>
                        <td style="padding: 18px 0 12px 0; color: #0f172a; font-weight: 700; font-size: 16px;">Total Paid</td>
                        <td style="padding: 18px 0 12px 0; color: #ea580c; font-weight: 700; font-size: 18px; text-align: right;">€{{ number_format($booking->total_price, 2) }}</td>
                    </tr>
                </table>

                <!-- Note / Action Warning Box -->
                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 32px;">
                    <strong style="color: #b45309; display: block; margin-bottom: 4px; font-size: 14px;">Important Details:</strong>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #78350f;">
                        Please arrive 10 minutes prior to the scheduled start time. If you have any dietary restrictions, food allergies, or special requests that you have not yet mentioned, kindly let us know by replying directly to this email.
                    </p>
                </div>

                <!-- Outro -->
                <p style="font-size: 15px; line-height: 1.5; color: #475569; margin: 0 0 24px 0;">
                    If you need to reschedule or have any other questions, feel free to reply to this email, call/WhatsApp us at <strong>+34 695 86 90 40</strong>, or visit our website's contact section.
                </p>
                <p style="font-size: 15px; color: #475569; margin: 0 0 4px 0;">We look forward to meeting you!</p>
                <p style="font-size: 15px; color: #475569; margin: 0;">Warm regards,</p>
                <strong style="color: #0f172a; display: block; font-size: 16px; margin-top: 6px;">The SpeakEasy Valencia Team</strong>
            </div>
        </div>

        <!-- Email Footer -->
        <div style="text-align: center; margin-top: 28px; font-size: 12px; color: #94a3b8; line-height: 1.6;">
            <p style="margin: 0;">&copy; {{ date('Y') }} SpeakEasy Valencia. All rights reserved.</p>
            <p style="margin: 4px 0 0 0;">Carrer de la Paz, Valencia, Spain &bull; +34 695 86 90 40</p>
        </div>
    </div>
</body>
</html>
