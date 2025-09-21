<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
   {
      Schema::table('stock_movements', function (Blueprint $table) {
         if (Schema::hasColumn('stock_movements', 'inventory_id')) {
            $table->dropForeign(['inventory_id']);
            $table->dropColumn('inventory_id');
         }
         if (Schema::hasColumn('stock_movements', 'quantity_change')) {
            $table->dropColumn('quantity_change');
         }
         if (Schema::hasColumn('stock_movements', 'source_id')) {
            $table->dropColumn('source_id');
         }
         if (Schema::hasColumn('stock_movements', 'source_type')) {
            $table->dropColumn('source_type');
         }

         if (!Schema::hasColumn('stock_movements', 'product_id')) {
            $table->foreignId('product_id')->constrained('products')->after('id');
         }
         if (!Schema::hasColumn('stock_movements', 'location_id')) {
            $table->foreignId('location_id')->constrained('locations')->after('product_id');
         }
         if (!Schema::hasColumn('stock_movements', 'quantity')) {
            $table->integer('quantity');
         }
         if (!Schema::hasColumn('stock_movements', 'cost_per_unit')) {
            $table->decimal('cost_per_unit', 15, 2)->nullable();
         }
      });
   }

   public function down(): void
   {
      Schema::table('stock_movements', function (Blueprint $table) {
         $table->dropConstrainedForeignId('product_id');
         $table->dropConstrainedForeignId('location_id');
         $table->dropColumn('quantity');
         $table->dropColumn('cost_per_unit');

         $table->foreignId('inventory_id')->nullable();
         $table->integer('quantity_change');
         $table->unsignedBigInteger('source_id')->nullable();
         $table->string('source_type')->nullable();
      });
   }
};
