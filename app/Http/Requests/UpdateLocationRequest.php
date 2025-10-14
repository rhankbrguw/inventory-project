<?php

namespace App\Http\Requests;

use App\Models\Type;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UpdateLocationRequest extends FormRequest
{
   public function authorize(): bool
   {
      return true;
   }

   public function rules(): array
   {
      return [
         'name' => ['required', 'string', 'max:100', Rule::unique('locations')->ignore($this->location)],
         'type_id' => ['required', 'integer', Rule::exists('types', 'id')->where('group', Type::GROUP_LOCATION)],
         'address' => ['nullable', 'string', 'max:150'],
         'assignments' => ['present', 'array'],
         'assignments.*.user_id' => ['required', 'exists:users,id'],
         'assignments.*.role_id' => ['required', 'exists:roles,id'],
      ];
   }

   public function withValidator($validator): void
   {
      $validator->after(function ($validator) {
         $locationType = Type::find($this->input('type_id'));

         if (!$locationType) {
            return;
         }

         $assignments = $this->input('assignments', []);

         foreach ($assignments as $index => $assignment) {
            $role = Role::find($assignment['role_id']);

            if (!$role) {
               continue;
            }

            $isWarehouse = $locationType->code === 'WH';
            $isBranch = $locationType->code === 'BR';

            if ($isWarehouse && $role->name === 'Branch Manager') {
               $validator->errors()->add(
                  "assignments.{$index}.role_id",
                  'Peran Branch Manager tidak valid untuk tipe Gudang.'
               );
            }

            if ($isBranch && $role->name === 'Warehouse Manager') {
               $validator->errors()->add(
                  "assignments.{$index}.role_id",
                  'Peran Warehouse Manager tidak valid untuk tipe Cabang.'
               );
            }
         }
      });
   }
}
