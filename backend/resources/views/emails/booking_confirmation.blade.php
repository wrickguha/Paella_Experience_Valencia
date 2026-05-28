<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Booking Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 24px; background: #f8f8f8;">
        <div style="background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #eaeaea;">
            <h1 style="font-size: 24px; margin-bottom: 16px; color: #111;">Booking Confirmed</h1>
            <p style="font-size: 16px; margin-bottom: 12px;">Hi {{ $booking->first_name }},</p>
            <p style="font-size: 16px; margin-bottom: 16px;">
                Thank you for booking with Paella Experience Valencia. Your booking reference is <strong>{{ $booking->reference }}</strong>.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Experience</td>
                    <td style="padding: 8px 0;">{{ $booking->experience->title_en }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Location</td>
                    <td style="padding: 8px 0;">{{ $booking->location->name_en }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Date</td>
                    <td style="padding: 8px 0;">{{ $booking->date->format('F j, Y') }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Time</td>
                    <td style="padding: 8px 0;">{{ $booking->time }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Guests</td>
                    <td style="padding: 8px 0;">{{ $booking->guests }}</td>
                </tr>
                @if($booking->coupon_code)
                <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Coupon</td>
                    <td style="padding: 8px 0;">{{ $booking->coupon_code }} ({{ $booking->discount_percent }}% off)</td>
                </tr>
                @endif
                <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Total Paid</td>
                    <td style="padding: 8px 0;">€{{ number_format($booking->total_price, 2) }}</td>
                </tr>
            </table>
            <p style="font-size: 16px; margin-bottom: 16px;">If you need to update your booking or have any questions, reply to this email or visit our website.</p>
            <p style="font-size: 16px; margin-bottom: 0;">See you soon,</p>
            <p style="font-size: 16px; font-weight: 600; margin-top: 4px;">Paella Experience Valencia Team</p>
        </div>
    </div>
</body>
</html>
