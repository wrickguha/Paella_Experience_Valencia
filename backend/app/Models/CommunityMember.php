<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunityMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'bio',
        'avatar',
        'country',
        'is_featured',
        'joined_at',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'joined_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
