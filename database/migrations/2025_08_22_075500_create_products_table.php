<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
   {
      Schema::create('products', function (Blueprint $table) {
         $table->id();
         $table->string('name');
         $table->string('sku')->unique();
         $table->text('description')->nullable();
         $table->decimal('price', 15, 2);
         $table->string('unit');
         $table->unsignedBigInteger('stock_quantity')->default(0);
         $table->unsignedBigInteger('low_stock_threshold')->default(10);
         $table->timestamps();
         $table->softDeletes();
      });
   }

   public function down(): void
   {
      Schema::dropIfExists('products');
   }
};
