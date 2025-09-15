<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
   /**
    *
    *
    * @return array<string, mixed>
    */
   public function toArray(Request $request): array
   {
      return [
         'id' => $this->id,
         'name' => $this->name,
         'contact_person' => $this->contact_person,
         'email' => $this->email,
         'phone' => $this->formatPhoneForDisplay($this->phone),
         'address' => $this->address,
         'notes' => $this->notes,
         'created_at' => $this->created_at,
         'updated_at' => $this->updated_at,
      ];
   }

   private function formatPhoneForDisplay($phone)
   {
      if (!$phone) return null;

      if (str_starts_with($phone, '+62')) {
         $localNumber = substr($phone, 3);
         $formattedLocal = "";

         if (strlen($localNumber) > 3) {
            $formattedLocal .= substr($localNumber, 0, 3);
            if (strlen($localNumber) > 7) {
               $formattedLocal .= "-" . substr($localNumber, 3, 4);
               $formattedLocal .= "-" . substr($localNumber, 7);
            } else {
               $formattedLocal .= "-" . substr($localNumber, 3);
            }
         } else {
            $formattedLocal = $localNumber;
         }

         return "+62 " . $formattedLocal;
      }

      return $phone;
   }
}
