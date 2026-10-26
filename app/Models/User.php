<?php

namespace App\Models;

use App\Mail\OtpMail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Translation\HasLocalePreference;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasLocalePreference, MustVerifyEmail
{
    use HasFactory, HasRoles, Notifiable, SoftDeletes;

    public const DEFAULT_FALLBACK_LEVEL = 999;

    public const OTP_MIN = 100000;

    public const OTP_MAX = 999999;

    public const OTP_EXPIRY_MINUTES = 5;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'locale',
        'password',
        'otp_code',
        'otp_expires_at',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
        'otp_expires_at',
    ];

    protected static function booted(): void
    {
        static::saved(fn ($user) => \Illuminate\Support\Facades\Cache::forget("user_perms_{$user->id}_{$user->level}"));
        static::deleted(fn ($user) => \Illuminate\Support\Facades\Cache::forget("user_perms_{$user->id}_{$user->level}"));
    }

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'otp_expires_at' => 'datetime',
        'phone' => 'encrypted',
    ];

    public function purchaseCartItems(): HasMany
    {
        return $this->hasMany(PurchaseCartItem::class);
    }

    public function sellCartItems(): HasMany
    {
        return $this->hasMany(SellCartItem::class);
    }

    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class)
            ->withPivot('role_id')
            ->withTimestamps();
    }

    public function getLevelAttribute(): int
    {
        return (int) ($this->relationLoaded('roles')
            ? ($this->roles->min('level') ?? self::DEFAULT_FALLBACK_LEVEL)
            : ($this->roles()->min('level') ?? self::DEFAULT_FALLBACK_LEVEL));
    }

    public function getRoleAtLocation(int $locationId): ?Role
    {
        if ($this->level === Role::LEVEL_SUPER_ADMIN) {
            return new Role(['name' => 'Super Admin', 'code' => Role::CODE_SUPER_ADMIN, 'level' => Role::LEVEL_SUPER_ADMIN]);
        }
        $pivot = $this->locations()->where('locations.id', $locationId)->first();

        return ($pivot && $pivot->pivot->role_id) ? Role::find($pivot->pivot->role_id) : null;
    }

    public function getRoleCodeAtLocation(int $locationId): ?string
    {
        $role = $this->getRoleAtLocation($locationId);

        return $role ? $role->code : null;
    }

    public function getAccessibleLocationIds(): ?array
    {
        if ($this->level === Role::LEVEL_SUPER_ADMIN) {
            return null;
        }
        $ids = $this->locations()->pluck('locations.id')->toArray();

        return empty($ids) ? [0] : $ids;
    }

    public function sendPasswordResetNotification(mixed $token): void
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }

    public function sendOtpNotification(): void
    {
        $otp = random_int(self::OTP_MIN, self::OTP_MAX);
        $this->forceFill([
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(self::OTP_EXPIRY_MINUTES),
        ])->save();

        Mail::to($this->email)->locale($this->preferredLocale())->queue(
            new OtpMail($this, (string) $otp, self::OTP_EXPIRY_MINUTES)
        );
    }

    public function preferredLocale(): string
    {
        return $this->locale ?? config('app.locale', 'id');
    }
}
