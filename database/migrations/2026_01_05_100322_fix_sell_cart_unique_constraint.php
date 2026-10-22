<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('sell_cart_items', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['user_id']);
            }
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['location_id']);
            }
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['product_id']);
            }

            $table->dropUnique(['user_id', 'location_id', 'product_id']);

            $table->unique(
                ['user_id', 'location_id', 'product_id', 'sales_channel_type_id'],
                'cart_item_unique_with_channel'
            );

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('location_id')->references('id')->on('locations')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sell_cart_items', function (Blueprint $table) {

            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['user_id']);
            }
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['location_id']);
            }
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['product_id']);
            }

            $table->dropUnique('cart_item_unique_with_channel');

            $table->unique(['user_id', 'location_id', 'product_id']);

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('location_id')->references('id')->on('locations')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });
    }
};
