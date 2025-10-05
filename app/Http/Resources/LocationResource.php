<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
   public function toArray(Request $request): array
   {
      return [
         'id' => $this->id,
         'name' => $this->name,
         'address' => $this->address,
         'deleted_at' => $this->deleted_at?->toISOString(),
         'type_id' => $this->type_id,
         'type' => $this->whenLoaded('type'),
         'users' => $this->whenLoaded('users', function () {
            return $this->users->map(function ($user) {
               return [
                  'id' => $user->id,
                  'name' => $user->name,
                  'pivot' => [
                     'user_id' => $user->pivot->user_id,
                     'role_id' => $user->pivot->role_id,
                  ],
               ];
            });
         }),
         'created_at' => $this->created_at?->toISOString(),
         'updated_at' => $this->updated_at?->toISOString(),
         'urls' => [
            'edit' => route('locations.edit', $this->id),
            'destroy' => route('locations.destroy', $this->id),
            'restore' => route('locations.restore', $this->id),
         ],
      ];
   }
}
