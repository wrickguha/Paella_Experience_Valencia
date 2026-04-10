<?php

namespace App\Http\Requests\API;

use Illuminate\Foundation\Http\FormRequest;

class CapturePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paypal_order_id' => ['required', 'string', 'max:255'],
        ];
    }
}
