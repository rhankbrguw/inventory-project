<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Location;
use App\Models\Type;

class LocationSeeder extends Seeder
{
   public function run(): void
   {
      $warehouseType = Type::firstOrCreate(
         ['group' => Type::GROUP_LOCATION, 'name' => 'Warehouse']
      );

      $branchType = Type::firstOrCreate(
         ['group' => Type::GROUP_LOCATION, 'name' => 'Branch']
      );

      $warehouses = [
         ['name' => 'Gudang Pusat A', 'type_id' => $warehouseType->id],
         ['name' => 'Gudang Pusat B', 'type_id' => $warehouseType->id],
         ['name' => 'Gudang Pusat C', 'type_id' => $warehouseType->id],
      ];

      foreach ($warehouses as $warehouse) {
         Location::create($warehouse);
      }

      $branches = [
         ['name' => 'ABSR', 'type_id' => $branchType->id],
         ['name' => 'MEDANG', 'type_id' => $branchType->id],
         ['name' => 'ALSUT', 'type_id' => $branchType->id],
         ['name' => 'PARIGI', 'type_id' => $branchType->id],
         ['name' => 'BINONG', 'type_id' => $branchType->id],
         ['name' => 'PAKOJAN', 'type_id' => $branchType->id],
         ['name' => 'CISAUK', 'type_id' => $branchType->id],
         ['name' => 'BSD PLAZA', 'type_id' => $branchType->id],
         ['name' => 'VIKTOR', 'type_id' => $branchType->id],
      ];

      foreach ($branches as $branch) {
         Location::create($branch);
      }
   }
}
