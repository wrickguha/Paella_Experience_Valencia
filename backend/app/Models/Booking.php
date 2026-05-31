<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\AvailabilitySlot;
use App\Mail\BookingConfirmation;
use App\Mail\NewBookingAdminNotification;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'location_id',
        'experience_id',
        'availability_slot_id',
        'date',
        'time',
        'guests',
        'coupon_code',
        'discount_percent',
        'discount_amount',
        'total_price',
        'payment_status',
        'payment_id',
        'language_preference',
        'notes',
        'status',
        'confirmation_sent',
    ];

    protected $casts = [
        'date' => 'date',
        'total_price' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'confirmation_sent' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            if (empty($booking->reference)) {
                $booking->reference = 'PEV-' . strtoupper(Str::random(8));
            }
        });

        static::created(function (Booking $booking) {
            if ($booking->payment_status === 'paid' && $booking->status !== 'cancelled') {
                if ($booking->availability_slot_id && $slot = AvailabilitySlot::find($booking->availability_slot_id)) {
                    $slot->increment('booked_slots', $booking->guests);
                }
            }
        });

        static::updated(function (Booking $booking) {
            $oldSlotId = $booking->getOriginal('availability_slot_id');
            $newSlotId = $booking->availability_slot_id;
            $oldGuests = (int) $booking->getOriginal('guests');
            $newGuests = (int) $booking->guests;

            $wasOccupying = ($booking->getOriginal('payment_status') === 'paid') && ($booking->getOriginal('status') !== 'cancelled');
            $isOccupying = ($booking->payment_status === 'paid') && ($booking->status !== 'cancelled');

            if ($oldSlotId === $newSlotId) {
                if ($wasOccupying && !$isOccupying) {
                    if ($oldSlotId && $slot = AvailabilitySlot::find($oldSlotId)) {
                        $slot->decrement('booked_slots', $oldGuests);
                    }
                } elseif (!$wasOccupying && $isOccupying) {
                    if ($newSlotId && $slot = AvailabilitySlot::find($newSlotId)) {
                        $slot->increment('booked_slots', $newGuests);
                    }
                } elseif ($wasOccupying && $isOccupying && $oldGuests !== $newGuests) {
                    if ($newSlotId && $slot = AvailabilitySlot::find($newSlotId)) {
                        $diff = $newGuests - $oldGuests;
                        if ($diff > 0) {
                            $slot->increment('booked_slots', $diff);
                        } else {
                            $slot->decrement('booked_slots', abs($diff));
                        }
                    }
                }
            } else {
                if ($wasOccupying && $oldSlotId) {
                    if ($slot = AvailabilitySlot::find($oldSlotId)) {
                        $slot->decrement('booked_slots', $oldGuests);
                    }
                }
                if ($isOccupying && $newSlotId) {
                    if ($slot = AvailabilitySlot::find($newSlotId)) {
                        $slot->increment('booked_slots', $newGuests);
                    }
                }
            }

            // Send emails when booking transitions to paid status
            $oldPaymentStatus = $booking->getOriginal('payment_status');
            $newPaymentStatus = $booking->payment_status;

            if ($oldPaymentStatus !== 'paid' && $newPaymentStatus === 'paid') {
                // 1. Send confirmation email to customer
                if (!empty($booking->email) && !$booking->confirmation_sent) {
                    try {
                        \Illuminate\Support\Facades\Mail::to($booking->email)
                            ->send(new BookingConfirmation($booking));
                        $booking->updateQuietly(['confirmation_sent' => true]);
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::error('Customer confirmation email failed', [
                            'booking' => $booking->reference,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                // 2. Send notification email to admin
                try {
                    \Illuminate\Support\Facades\Mail::to('Info@speakeasyvalencia.com')
                        ->send(new NewBookingAdminNotification($booking));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Admin booking notification email failed', [
                        'booking' => $booking->reference,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        });

        static::deleted(function (Booking $booking) {
            if ($booking->payment_status === 'paid' && $booking->status !== 'cancelled') {
                if ($booking->availability_slot_id && $slot = AvailabilitySlot::find($booking->availability_slot_id)) {
                    $slot->decrement('booked_slots', $booking->guests);
                }
            }
        });
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function experience(): BelongsTo
    {
        return $this->belongsTo(Experience::class);
    }

    public function availabilitySlot(): BelongsTo
    {
        return $this->belongsTo(AvailabilitySlot::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
