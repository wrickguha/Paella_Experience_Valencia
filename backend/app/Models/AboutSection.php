<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_key',
        'title_en',
        'title_es',
        'content_en',
        'content_es',
        'subtitle_en',
        'subtitle_es',
        'image',
        'cta_text_en',
        'cta_text_es',
        'cta_link',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
