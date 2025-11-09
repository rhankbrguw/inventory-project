<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table("purchase_cart_items", function (Blueprint $table) {
            $table->dropForeign(["user_id"]);
            $table->dropForeign(["product_id"]);
            $table->dropForeign(["supplier_id"]);

            $table->dropUnique(
                "purchase_cart_items_user_id_product_id_supplier_id_unique",
            );

            $table
                ->foreignId("supplier_id")
                ->nullable()
                ->change();

            $table
                ->foreign("user_id")
                ->references("id")
                ->on("users")
                ->onDelete("cascade");
            $table
                ->foreign("product_id")
                ->references("id")
                ->on("products")
                ->onDelete("cascade");
            $table
                ->foreign("supplier_id")
                ->references("id")
                ->on("suppliers")
                ->onDelete("cascade");

            $table->unique(["user_id", "product_id", "supplier_id"]);
        });
    }

    public function down(): void
    {
        Schema::table("purchase_cart_items", function (Blueprint $table) {
            $table->dropForeign(["user_id"]);
            $table->dropForeign(["product_id"]);
            $table->dropForeign(["supplier_id"]);
            $table->dropUnique(
                "purchase_cart_items_user_id_product_id_supplier_id_unique",
            );

            $table
                ->foreignId("supplier_id")
                ->nullable(false)
                ->change();

            $table
                ->foreign("user_id")
                ->references("id")
                ->on("users")
                ->onDelete("cascade");
            $table
                ->foreign("product_id")
                ->references("id")
                ->on("products")
                ->onDelete("cascade");
            $table
                ->foreign("supplier_id")
                ->references("id")
                ->on("suppliers")
                ->onDelete("cascade");

            $table->unique(["user_id", "product_id", "supplier_id"]);
        });
    }
};
