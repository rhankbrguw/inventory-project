<?php

namespace App\Models;

use App\Traits\ScopedByLocation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Supplier extends Model
{
    use HasFactory, ScopedByLocation, SoftDeletes;

    protected $fillable = [
        'location_id',
        'name',
        'contact_person',
        'email',
        'phone',
        'address',
        'notes',
    ];

    protected static function booted(): void
    {
        static::saved(fn () => \Illuminate\Support\Facades\Cache::forget('suppliers_dropdown_all'));
        static::deleted(fn () => \Illuminate\Support\Facades\Cache::forget('suppliers_dropdown_all'));
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_supplier');
    }

    public function setPhoneAttribute(?string $value): void
    {
        if (empty($value)) {
            $this->attributes['phone'] = null;

            return;
        }
        $cleanedPhone = preg_replace("/[^\d\+]/", '', $value);
        if (Str::startsWith($cleanedPhone, '08')) {
            $cleanedPhone = '+628'.substr($cleanedPhone, 2);
        }
        $this->attributes['phone'] = $cleanedPhone;
    }
}
