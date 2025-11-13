<?php

namespace App\Models;

use App\Mail\OtpMail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory;
    use Notifiable;
    use HasRoles;

    protected $fillable = [
        "name",
        "email",
        "password",
        "otp_code",
        "otp_expires_at",
        "email_verified_at",
    ];

    protected $hidden = [
        "password",
        "remember_token",
        "otp_code",
        "otp_expires_at",
    ];

    protected function casts(): array
    {
        return [
            "email_verified_at" => "datetime",
            "password" => "hashed",
            "otp_expires_at" => "datetime",
        ];
    }

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
            ->withPivot("role_id")
            ->withTimestamps();
    }

    public function getAccessibleLocationIds(): ?array
    {
        if ($this->hasRole('Super Admin')) {
            return null;
        }

        $ids = $this->locations()->pluck('locations.id')->toArray();

        if (empty($ids)) {
            return [0];
        }

        return $ids;
    }

    public function sendOtpNotification(): void
    {
        $otp = random_int(100000, 999999);
        $expiresAt = now()->addMinutes(5);

        $this->forceFill([
            "otp_code" => $otp,
            "otp_expires_at" => $expiresAt,
        ])->save();

        Mail::to($this->email)->send(new OtpMail($this, (string) $otp, 5));
    }
}
