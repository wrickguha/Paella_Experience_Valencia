<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'source',
        'name',
        'email',
        'phone',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function scopeBySource($query, string $source)
    {
        return $query->where('source', $source);
    }
}
