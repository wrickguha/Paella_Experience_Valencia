<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlogPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title_en',
        'title_es',
        'slug',
        'excerpt_en',
        'excerpt_es',
        'content_en',
        'content_es',
        'featured_image',
        'author_name',
        'author_avatar',
        'author_role',
        'reading_time',
        'is_featured',
        'is_published',
        'published_at',
        'views_count',
        'sort_order',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'views_count' => 'integer',
        'sort_order' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'category_id');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function getTitle(string $lang = 'en'): string
    {
        return $lang === 'es' ? ($this->title_es ?: $this->title_en) : $this->title_en;
    }

    public function getExcerpt(string $lang = 'en'): ?string
    {
        return $lang === 'es' ? ($this->excerpt_es ?: $this->excerpt_en) : $this->excerpt_en;
    }

    public function getContent(string $lang = 'en'): string
    {
        return $lang === 'es' ? ($this->content_es ?: $this->content_en) : $this->content_en;
    }

    public function getImageUrl(): ?string
    {
        if (!$this->featured_image) return null;
        if (str_starts_with($this->featured_image, 'http')) return $this->featured_image;
        $cleanPath = ltrim($this->featured_image, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        }
        return asset('storage/' . $cleanPath);
    }
}
