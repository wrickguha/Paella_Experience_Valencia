<?php

namespace App\Http\Requests\API;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source'   => ['required', 'in:whatsapp,community_cta,community_join,language_join,contact'],
            'name'     => ['nullable', 'string', 'max:255'],
            'email'    => ['nullable', 'email', 'max:255'],
            'phone'    => ['nullable', 'string', 'max:30'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
