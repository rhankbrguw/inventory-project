<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
   use Queueable, SerializesModels;

   public User $user;
   public string $otp;
   public int $validityDuration;

   public function __construct(User $user, string $otp, int $validityDuration = 5)
   {
      $this->user = $user;
      $this->otp = $otp;
      $this->validityDuration = $validityDuration;
   }

   public function envelope(): Envelope
   {
      return new Envelope(
         subject: 'Kode Verifikasi Akun Anda',
      );
   }

   public function content(): Content
   {
      return new Content(
         view: 'emails.otp',
      );
   }

   public function attachments(): array
   {
      return [];
   }
}
