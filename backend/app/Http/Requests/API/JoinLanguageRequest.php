<?php

namespace App\Http\Requests\API;

use Illuminate\Foundation\Http\FormRequest;

class JoinLanguageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'max:255'],
            'language_type'  => ['required', 'in:spanish,english,both'],
            'skill_level'    => ['nullable', 'in:beginner,intermediate,advanced'],
        ];
    }
}
