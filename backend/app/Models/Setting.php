<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'group',
    ];

    /**
     * Get a setting value by key, with optional default.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $settings = Cache::remember('settings_all', 3600, function () {
            return static::pluck('value', 'key')->toArray();
        });

        return $settings[$key] ?? $default;
    }

    /**
     * Get settings by group.
     */
    public static function getByGroup(string $group): array
    {
        return Cache::remember("settings_{$group}", 3600, function () use ($group) {
            return static::where('group', $group)->pluck('value', 'key')->toArray();
        });
    }

    /**
     * Flush settings cache on save.
     */
    protected static function booted(): void
    {
        static::saved(function () {
            Cache::forget('settings_all');
            Cache::flush(); // clear group caches too
        });
    }
}
