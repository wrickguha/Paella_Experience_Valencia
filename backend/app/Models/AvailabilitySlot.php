<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvailabilitySlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'location_id',
        'date',
        'start_time',
        'end_time',
        'total_slots',
        'booked_slots',
        'is_blocked',
    ];

    protected $casts = [
        'date' => 'date',
        'is_blocked' => 'boolean',
    ];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Available spots remaining.
     */
    public function getRemainingAttribute(): int
    {
        return max(0, $this->total_slots - $this->booked_slots);
    }

    /**
     * Whether this slot can accept more bookings.
     */
    public function getIsAvailableAttribute(): bool
    {
        return !$this->is_blocked && $this->remaining > 0;
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_blocked', false)
            ->whereColumn('booked_slots', '<', 'total_slots');
    }

    public function scopeForDate($query, string $date)
    {
        return $query->where('date', $date);
    }

    public function scopeForLocation($query, int $locationId)
    {
        return $query->where('location_id', $locationId);
    }
}
