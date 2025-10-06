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
         'type' => $this->whenLoaded('type', function () {
            return [
               'id' => $this->type->id,
               'name' => $this->type->name,
            ];
         }),
         'users' => UserResource::collection($this->whenLoaded('users')),
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
