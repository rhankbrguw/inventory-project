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
         $table->foreignId('product_id')->constrained()->onDelete('cascade');
         $table->foreignId('location_id')->constrained()->onDelete('cascade');
         $table->foreignId('purchase_id')->nullable()->constrained()->onDelete('set null');
         $table->string('type');
         $table->decimal('quantity', 15, 4);
         $table->decimal('cost_per_unit', 15, 4)->nullable();
         $table->text('notes')->nullable();
         $table->timestamps();
      });
   }

   public function down(): void
   {
      Schema::dropIfExists('stock_movements');
   }
};
