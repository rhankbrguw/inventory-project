<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->unsignedBigInteger('sales_channel_type_id')->nullable()->after('product_id');
            $table->foreign('sales_channel_type_id')->references('id')->on('types')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['sales_channel_type_id']);
            $table->dropColumn('sales_channel_type_id');
        });
    }
};
