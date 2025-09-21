<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Location;

class LocationSeeder extends Seeder
{
   public function run(): void
   {
      $warehouses = [
         ['name' => 'Gudang Pusat A', 'type' => 'warehouse'],
         ['name' => 'Gudang Pusat B', 'type' => 'warehouse'],
         ['name' => 'Gudang Pusat C', 'type' => 'warehouse'],
      ];

      foreach ($warehouses as $warehouse) {
         Location::create($warehouse);
      }

      $branches = [
         ['name' => 'ABSR', 'type' => 'branch'],
         ['name' => 'MEDANG', 'type' => 'branch'],
         ['name' => 'ALSUT', 'type' => 'branch'],
         ['name' => 'PARIGI', 'type' => 'branch'],
         ['name' => 'BINONG', 'type' => 'branch'],
         ['name' => 'PAKOJAN', 'type' => 'branch'],
         ['name' => 'CISAUK', 'type' => 'branch'],
         ['name' => 'BSD PLAZA', 'type' => 'branch'],
         ['name' => 'VIKTOR', 'type' => 'branch'],
      ];

      foreach ($branches as $branch) {
         Location::create($branch);
      }
   }
}
