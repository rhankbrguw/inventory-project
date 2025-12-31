<?php

namespace App\Models;

use App\Mail\OtpMail;
use App\Models\Role;
use App\Models\Location;
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
        "phone",
        'locale',
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


    public function getLevelAttribute(): int
    {
        return $this->roles->min('level') ?? 999;
    }

    public function getRoleAtLocation(int $locationId): ?Role
    {
        if ($this->level === 1) {
            return new Role(['name' => 'Super Admin', 'code' => 'ADM', 'level' => 1]);
        }

        $pivot = $this->locations()
            ->where('locations.id', $locationId)
            ->first();

        if (!$pivot) {
            return null;
        }

        return Role::find($pivot->pivot->role_id);
    }

    public function getRoleCodeAtLocation($locationId): ?string
    {
        $role = $this->getRoleAtLocation($locationId);
        return $role ? $role->code : null;
    }

    public function getAccessibleLocationIds(): ?array
    {
        if ($this->level === 1) {
            return null;
        }

        $ids = $this->locations()->pluck('locations.id')->toArray();

        if (empty($ids)) {
            return [0];
        }

        return $ids;
    }


    public function canTransactAtLocation($locationId, $transactionType): bool
    {
        if ($this->level === 1) {
            return true;
        }

        $role = $this->getRoleAtLocation($locationId);
        if (!$role) {
            return false;
        }

        $location = Location::with('type')->find($locationId);
        if (!$location) {
            return false;
        }

        $roleLevel = $role->level;
        $roleCode = $role->code;
        $locationLevel = $location->type->level;

        if ($transactionType === 'purchase') {
            if ($roleLevel > 10) {
                return false;
            }


            if ($locationLevel === 1 && $roleCode === 'BRM') {
                return false;
            }

            if ($locationLevel === 2 && $roleCode === 'WHM') {
                return false;
            }

            return true;
        }

        if ($transactionType === 'sell') {
            if ($locationLevel === 1) {
                return false;
            }

            if ($locationLevel === 2) {
                return true;
            }
        }

        if ($transactionType === 'transfer') {
            return $roleLevel <= 10;
        }

        return false;
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
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
