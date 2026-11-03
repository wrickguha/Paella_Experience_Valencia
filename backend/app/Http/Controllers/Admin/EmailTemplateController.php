<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ContactMessage;
use App\Models\EmailTemplate;
use App\Models\Experience;
use App\Models\Location;
use App\Services\EmailTemplateService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmailTemplateController extends Controller
{
    public function index()
    {
        return EmailTemplate::orderByDesc('is_system')->orderBy('name')->get();
    }

    public function preview(Request $request, EmailTemplate $emailTemplate, EmailTemplateService $templateService)
    {
        abort_unless($emailTemplate->is_system, 404);
        $bodyText = $request->query->has('body_text')
            ? (string) $request->query('body_text', '')
            : $emailTemplate->body_text;

        if (in_array($emailTemplate->key, ['booking_confirmation', 'new_booking_admin_notification'], true)) {
            $booking = new Booking([
                'reference' => 'PEV-2026-001',
                'first_name' => 'Alex',
                'last_name' => 'Rivera',
                'email' => 'alex@example.com',
                'phone' => '+34 600 123 456',
                'date' => now()->addWeek()->toDateString(),
                'time' => '18:30',
                'guests' => 2,
                'coupon_code' => 'VALENCIA10',
                'discount_percent' => 10,
                'total_price' => 90,
                'language_preference' => 'English',
                'notes' => 'Vegetarian menu, please.',
            ]);
            $booking->setRelation('location', new Location(['name_en' => 'Valencia Kitchen']));
            $booking->setRelation('experience', new Experience(['title_en' => 'Paella cooking experience']));

            $view = $emailTemplate->key === 'booking_confirmation'
                ? 'emails.booking_confirmation'
                : 'emails.new_booking_admin_notification';

            return response()->view($view, [
                'booking' => $booking,
                'emailBodyText' => $templateService->renderBodyText($bodyText, ['booking' => $booking]),
            ]);
        }

        if ($emailTemplate->key === 'new_contact_message_admin_notification') {
            $contactMessage = new ContactMessage([
                'name' => 'Alex Rivera',
                'email' => 'alex@example.com',
                'subject' => 'Question about the paella class',
                'message' => 'Hello! Could you please share more details about the class?',
            ]);

            return response()->view('emails.new_contact_message_admin_notification', [
                'contactMessage' => $contactMessage,
                'emailBodyText' => $templateService->renderBodyText($bodyText, ['contactMessage' => $contactMessage]),
            ]);
        }

        if ($emailTemplate->key === 'new_level_test_admin_notification') {
            $data = [
                'name' => 'Alex Rivera',
                'email' => 'alex@example.com',
                'language_type' => 'Spanish',
                'skill_level' => 'Intermediate',
                'audio_url' => null,
            ];
            $data['emailBodyText'] = $templateService->renderBodyText($bodyText, $data);

            return response()->view('emails.new_level_test_admin_notification', $data);
        }

        abort(404);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'key' => ['required', 'string', 'alpha_dash:ascii', 'max:100', Rule::unique('email_templates', 'key')],
            'name' => ['required', 'string', 'max:120'],
            'subject' => ['required', 'string', 'max:255'],
            'body_text' => ['required', 'string', 'max:65535'],
        ]);

        $data['available_variables'] = [];
        $data['is_active'] = false;
        $data['is_system'] = false;

        return response()->json(EmailTemplate::create($data), 201);
    }

    public function update(Request $request, EmailTemplate $emailTemplate)
    {
        $data = $request->validate([
            'key' => $emailTemplate->is_system
                ? ['required', 'string', Rule::in([$emailTemplate->key])]
                : [
                    'required',
                    'string',
                    'alpha_dash:ascii',
                    'max:100',
                    Rule::unique('email_templates', 'key')->ignore($emailTemplate->id),
                ],
            'name' => ['required', 'string', 'max:120'],
            'subject' => ['required', 'string', 'max:255'],
            'body_text' => [$emailTemplate->is_system ? 'nullable' : 'required', 'string', 'max:65535'],
            'is_active' => [$emailTemplate->is_system ? 'required' : 'nullable', 'boolean'],
        ]);

        if (! $emailTemplate->is_system) {
            $data['is_active'] = false;
        }

        $emailTemplate->update($data);

        return response()->json($emailTemplate->refresh());
    }

    public function destroy(EmailTemplate $emailTemplate)
    {
        if ($emailTemplate->is_system) {
            return response()->json(['message' => 'Built-in email templates cannot be deleted.'], 403);
        }

        $emailTemplate->delete();

        return response()->json(['message' => 'Email template deleted.']);
    }
}
