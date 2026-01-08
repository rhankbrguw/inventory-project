<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Customer extends Model
{
    use HasFactory;
    use SoftDeletes;
    use \App\Traits\ScopedByLocation;

    public const CODE_BRANCH_CUSTOMER = 'CBG';

    protected $fillable = [
        'location_id',
        'name',
        'type_id',
        'email',
        'phone',
        'address',
        'related_location_id',
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'type_id');
    }

    public function relatedLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'related_location_id');
    }

    public function sells(): HasMany
    {
        return $this->hasMany(Sell::class);
    }

    public function isBranchCustomer(): bool
    {
        return $this->type && $this->type->code === self::CODE_BRANCH_CUSTOMER;
    }

    public function setPhoneAttribute($value)
    {
        if (empty($value)) {
            $this->attributes['phone'] = null;
            return;
        }
        $cleanedPhone = preg_replace('/[^\d\+]/', '', $value);
        if (Str::startsWith($cleanedPhone, '08')) {
            $cleanedPhone = '+628' . substr($cleanedPhone, 2);
        } elseif (str_starts_with($cleanedPhone, '62')) {
            $cleanedPhone = '+' . $cleanedPhone;
        }
        $this->attributes['phone'] = $cleanedPhone;
    }
}
