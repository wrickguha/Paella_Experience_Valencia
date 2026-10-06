<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GalleryCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_es',
        'slug',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(Gallery::class, 'category_id');
    }

    public function getName(string $lang = 'en'): string
    {
        return $lang === 'es' ? ($this->name_es ?: $this->name_en) : $this->name_en;
    }
}
