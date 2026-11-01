<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmailTemplateController extends Controller
{
    public function index()
    {
        return EmailTemplate::orderByDesc('is_system')->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'key' => ['required', 'string', 'alpha_dash:ascii', 'max:100', Rule::unique('email_templates', 'key')],
            'name' => ['required', 'string', 'max:120'],
            'subject' => ['required', 'string', 'max:255'],
            'body_html' => ['required', 'string', 'max:65535'],
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
            'body_html' => [$emailTemplate->is_system ? 'nullable' : 'required', 'string', 'max:65535'],
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
