<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
   use HasApiTokens, HasFactory, HasRoles, Notifiable;

   protected $fillable = [
      'name',
      'email',
      'password',
      'otp_code',
      'otp_expires_at',
   ];

   protected $hidden = [
      'password',
      'remember_token',
      'otp_code',
   ];

   protected $casts = [
      'email_verified_at' => 'datetime',
      'password' => 'hashed',
      'otp_expires_at' => 'datetime',
   ];
}
