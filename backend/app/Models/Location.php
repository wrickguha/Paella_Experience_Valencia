<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_es',
        'description_en',
        'description_es',
        'address',
        'image',
        'availability_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function experiences(): HasMany
    {
        return $this->hasMany(Experience::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(LocationImage::class)->orderBy('sort_order');
    }

    public function availabilitySlots(): HasMany
    {
        return $this->hasMany(AvailabilitySlot::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Scope to only active locations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Return localized name.
     */
    public function getLocalizedName(string $lang = 'en'): string
    {
        return $lang === 'es' ? $this->name_es : $this->name_en;
    }

    /**
     * Return localized description.
     */
    public function getLocalizedDescription(string $lang = 'en'): string
    {
        return $lang === 'es' ? $this->description_es : $this->description_en;
    }
}
