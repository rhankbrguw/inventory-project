<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    Log::info('CALLBACK REACHED', [
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email
        ] : 'NULL USER',
        'requested_id' => $id,
        'match' => $user && (int) $user->id === (int) $id,
        'auth_check' => auth()->check(),
        'auth_id' => auth()->id(),
    ]);

    return $user && (int) $user->id === (int) $id;
});
