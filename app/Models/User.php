<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;

class User extends Authenticatable implements MustVerifyEmail
{
   use HasFactory, Notifiable, HasRoles, MustVerifyEmailTrait;

   protected $fillable = [
      'name',
      'email',
      'password',
   ];

   protected $hidden = [
      'password',
      'remember_token',
   ];

   protected function casts(): array
   {
      return [
         'email_verified_at' => 'datetime',
         'password' => 'hashed',
      ];
   }

   public function locations(): BelongsToMany
   {
      return $this->belongsToMany(Location::class)->withPivot('role_id')->withTimestamps();
   }
}
