<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hasRoles = $this->relationLoaded('roles');
        $role = $hasRoles ? $this->roles->first() : null;
        $hasPivot = $this->relationLoaded('pivot');

        return [
            'id' => $this->id, 'name' => $this->name, 'email' => $this->email, 'phone' => $this->phone,
            'level' => $hasRoles ? (int) ($this->roles->min('level') ?? 999) : 999,
            'roles' => $hasRoles ? $this->roles->pluck('name') : [],
            'role' => $role ? ['name' => $role->name, 'code' => $role->code, 'level' => (int) $role->level] : null,
            'role_code' => $role?->code,
            'role_id' => $hasPivot ? (int) $this->pivot->role_id : null,
            'pivot' => $hasPivot ? [
                'role_id' => (int) $this->pivot->role_id,
                'location_id' => (int) $this->pivot->location_id,
                'user_id' => (int) $this->pivot->user_id,
            ] : null,
            'locations' => $this->whenLoaded('locations', fn () => $this->locations->map(fn ($l) => [
                'id' => $l->id, 'name' => $l->name, 'role_id' => $l->pivot->role_id ?? null,
                'role_code' => $this->getRoleCodeAtLocation($l->id),
                'type' => $l->type ? ['id' => $l->type->id, 'name' => $l->type->name, 'code' => $l->type->code, 'level' => $l->type->level] : null,
            ])),
            'created_at' => $this->created_at?->toISOString(), 'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
