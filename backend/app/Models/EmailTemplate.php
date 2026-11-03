<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    protected $fillable = [
        'key',
        'name',
        'subject',
        'body_text',
        'available_variables',
        'is_active',
        'is_system',
    ];

    protected $hidden = [
        'body_html',
    ];

    protected function casts(): array
    {
        return [
            'available_variables' => 'array',
            'is_active' => 'boolean',
            'is_system' => 'boolean',
        ];
    }
}
