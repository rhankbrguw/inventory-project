<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
   {
      Schema::table('products', function (Blueprint $table) {
         $table->foreignId('type_id')->nullable()->after('id')->constrained('types')->onDelete('set null');
         $table->foreignId('default_supplier_id')->nullable()->after('type_id')->constrained('suppliers')->onDelete('set null');

         $table->dropColumn(['stock_quantity', 'low_stock_threshold']);
      });
   }

   public function down(): void
   {
      Schema::table('products', function (Blueprint $table) {
         $table->dropConstrainedForeignId('type_id');
         $table->dropConstrainedForeignId('default_supplier_id');

         $table->unsignedBigInteger('stock_quantity')->default(0);
         $table->unsignedBigInteger('low_stock_threshold')->default(10);
      });
   }
};
