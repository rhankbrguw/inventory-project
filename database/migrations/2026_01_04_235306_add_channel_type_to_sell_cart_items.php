<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('sell_cart_items', function (Blueprint $table) {
            if (!Schema::hasColumn('sell_cart_items', 'sales_channel_type_id')) {
                $table->unsignedBigInteger('sales_channel_type_id')->nullable()->after('product_id');

                $table->foreign('sales_channel_type_id')->references('id')->on('types')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('sell_cart_items', function (Blueprint $table) {
            if (Schema::hasColumn('sell_cart_items', 'sales_channel_type_id')) {
                $table->dropForeign(['sales_channel_type_id']);
                $table->dropColumn('sales_channel_type_id');
            }
        });
    }
};
