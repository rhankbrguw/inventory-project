<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
   {
      Schema::create('stock_movements', function (Blueprint $table) {
         $table->id();
         $table->foreignId('inventory_id')->constrained()->onDelete('cascade');
         $table->decimal('quantity_change', 15, 4);
         $table->string('type');
         $table->morphs('source');
         $table->text('notes')->nullable();
         $table->timestamps();
      });
   }

   public function down(): void
   {
      Schema::dropIfExists('stock_movements');
   }
};
