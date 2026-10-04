<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BlogCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_es',
        'slug',
        'description_en',
        'description_es',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function posts(): HasMany
    {
        return $this->hasMany(BlogPost::class, 'category_id')->orderBy('published_at', 'desc');
    }

    public function publishedPosts(): HasMany
    {
        return $this->hasMany(BlogPost::class, 'category_id')
            ->where('is_published', true)
            ->orderBy('published_at', 'desc');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getName(string $lang = 'en'): string
    {
        return $lang === 'es' ? ($this->name_es ?: $this->name_en) : $this->name_en;
    }

    public function getDescription(string $lang = 'en'): ?string
    {
        return $lang === 'es' ? ($this->description_es ?: $this->description_en) : $this->description_en;
    }
}
