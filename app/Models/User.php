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

    public function getRoleCodeAtLocation($locationId): ?string
    {
        if ($this->level === 1) {
            return 'SUPERADMIN';
        }

        $pivot = $this->locations()
            ->where('locations.id', $locationId)
            ->first();

        if (!$pivot) {
            return null;
        }

        $role = Role::find($pivot->pivot->role_id);
        return $role?->code;
    }

    public function getEffectiveRoleAtLocation($locationId): ?string
    {
        if ($this->level === 1) {
            return 'SUPERADMIN';
        }

        $roleCode = $this->getRoleCodeAtLocation($locationId);

        if ($roleCode === 'STF') {
            $location = Location::find($locationId);
            if ($location) {
                $locationType = $location->type->code;
                if ($locationType === 'WH') {
                    return 'WHM';
                } elseif ($locationType === 'BR') {
                    return 'BRM';
                }
            }
        }

        return $roleCode;
    }

    public function canActAsRoleAtLocation($locationId, $requiredRoles): bool
    {
        if ($this->level === 1) {
            return true;
        }

        $effectiveRole = $this->getEffectiveRoleAtLocation($locationId);

        if (is_array($requiredRoles)) {
            return in_array($effectiveRole, $requiredRoles);
        }

        return $effectiveRole === $requiredRoles;
    }

    public function hasRoleAtLocation($locationId, $roleCodes): bool
    {
        if ($this->level === 1) {
            return true;
        }

        $roleCode = $this->getRoleCodeAtLocation($locationId);

        if (is_array($roleCodes)) {
            return in_array($roleCode, $roleCodes);
        }

        return $roleCode === $roleCodes;
    }

    public function canTransactAtLocation($locationId, $transactionType): bool
    {
        if ($this->level === 1) {
            return true;
        }

        $roleCode = $this->getRoleCodeAtLocation($locationId);

        if ($transactionType === 'purchase') {
            return in_array($roleCode, ['WHM', 'BRM']);
        }

        if ($transactionType === 'sell') {
            return in_array($roleCode, ['BRM', 'CSH']);
        }

        if ($transactionType === 'transfer') {
            return $roleCode === 'WHM';
        }

        return false;
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
