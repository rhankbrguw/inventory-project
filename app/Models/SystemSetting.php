<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        return \Illuminate\Support\Facades\Cache::remember("sys_setting_{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            return $setting ? $setting->value : $default;
        });
    }

    public static function set(string $key, mixed $value): void
    {
        \Illuminate\Support\Facades\Cache::forget("sys_setting_{$key}");
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    public static function isSetupCompleted(): bool
    {
        return static::get('setup_completed', 'false') === 'true';
    }

    public static function markSetupCompleted(): void
    {
        static::set('setup_completed', 'true');
    }
}
