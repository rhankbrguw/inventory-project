<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via()
    {
        return ['mail'];
    }

    public function toMail(mixed $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        $url = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        return (new MailMessage)
            ->subject('Password Reset Request')
            ->view([
                'html' => 'emails.reset_password',
                'text' => 'emails.reset_password_plain',
            ], [
                'url' => $url,
                'user' => $notifiable,
            ]);
    }
}
