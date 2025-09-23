<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Type;

class TypeSeeder extends Seeder
{
   public function run(): void
   {
      $productTypes = [
         ['name' => 'Bahan Baku', 'group' => 'product_type', 'code' => 'BB'],
         ['name' => 'Menu Jadi', 'group' => 'product_type', 'code' => 'MJ'],
         ['name' => 'Setengah Jadi', 'group' => 'product_type', 'code' => 'SJ'],
         ['name' => 'Lainnya', 'group' => 'product_type', 'code' => 'LL'],
      ];

      foreach ($productTypes as $type) {
         Type::create($type);
      }
   }
}
