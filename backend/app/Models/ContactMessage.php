<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = [
        'name',
        'email',
        'subject',
        'message',
        'is_read',
        'is_resolved',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'is_resolved' => 'boolean',
        ];
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
