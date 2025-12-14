<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

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
                    'level' => $firstRole->level,
                ] : null;
            }),
            'locations' => $this->whenLoaded('locations', function () {
                return $this->locations->map(function ($location) {
                    return [
                        'id' => $location->id,
                        'name' => $location->name,
                        'type' => $location->type ? [
                            'code' => $location->type->code,
                            'name' => $location->type->name,
                            'level' => $location->type->level,
                        ] : null,
                    ];
                });
            }),
            'pivot' => $this->whenPivotLoaded('location_user', fn () => [
                'role_id' => $this->pivot->role_id,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
