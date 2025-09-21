<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
   {
      Schema::table('stock_movements', function (Blueprint $table) {
         $table->foreignId('purchase_id')->nullable()->constrained('purchases')->after('id');
      });
   }

   public function down(): void
   {
      Schema::table('stock_movements', function (Blueprint $table) {
         $table->dropForeign(['purchase_id']);
         $table->dropColumn('purchase_id');
      });
   }
};
