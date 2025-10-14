<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'type_id',
        'email',
        'phone',
        'address',
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'type_id');
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
