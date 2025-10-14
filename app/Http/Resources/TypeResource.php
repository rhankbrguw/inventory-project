<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TypeResource extends JsonResource
{
   public function toArray(Request $request): array
   {
      return [
         'id' => $this->id,
         'name' => $this->name,
         'group' => $this->group,
         'code' => $this->code,
         'created_at' => $this->created_at?->toISOString(),
         'updated_at' => $this->updated_at?->toISOString(),
      ];
   }
}
