<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Supplier extends Model
{
   use HasFactory;

   protected $fillable = [
      'name',
      'contact_person',
      'email',
      'phone',
      'address',
      'notes',
   ];

   public function setPhoneAttribute($value)
   {
      if (empty($value)) {
         $this->attributes['phone'] = null;
         return;
      }

      $cleanedPhone = preg_replace('/[^\d\+]/', '', $value);

      if (Str::startsWith($cleanedPhone, '08')) {
         $cleanedPhone = '+628' . substr($cleanedPhone, 2);
      }

      $this->attributes['phone'] = $cleanedPhone;
   }
}
