<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
    ];

    protected $appends = [
        'name',
    ];

    public function getNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
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
