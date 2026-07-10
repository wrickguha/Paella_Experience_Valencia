<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LanguageSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'title_en',
        'title_es',
        'description_en',
        'description_es',
        'language_type',
        'skill_level',
        'is_active',
        'sort_order',
        'test_type',
        'audio_url',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getTitle(string $lang = 'en'): string
    {
        return $lang === 'es' ? ($this->title_es ?: $this->title_en) : $this->title_en;
    }

    public function getDescription(string $lang = 'en'): ?string
    {
        return $lang === 'es' ? ($this->description_es ?: $this->description_en) : $this->description_en;
    }
}
