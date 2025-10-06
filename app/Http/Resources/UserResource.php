<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
   public function toArray(Request $request): array
   {
      return [
         'id' => $this->id,
         'name' => $this->name,
         'email' => $this->email,
         'role' => $this->whenLoaded('roles', function () {
            $firstRole = $this->roles->first();
            return $firstRole ? [
               'name' => $firstRole->name,
               'code' => $firstRole->code,
            ] : null;
         }),
         'pivot' => $this->whenPivotLoaded('location_user', function () {
            return [
               'role_id' => $this->pivot->role_id,
            ];
         }),
         'created_at' => $this->created_at?->toISOString(),
         'updated_at' => $this->updated_at?->toISOString(),
      ];
   }
}
