<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type_id' => $this->type_id,
            'type' => TypeResource::make($this->whenLoaded('type')),
            'email' => $this->email,
            'phone' => $this->formatPhone($this->phone),
            'address' => $this->address,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function formatPhone(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        if (str_starts_with($phone, '+62')) {
            $local = substr($phone, 3);
            return '+62 ' . preg_replace('/(\d{3})(\d{3,4})(\d{3,4})/', '$1-$2-$3', $local);
        }

        return $phone;
    }
}
