<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create("sell_cart_items", function (Blueprint $table) {
            $table->id();
            $table->foreignId("user_id")->constrained()->onDelete("cascade");
            $table
                ->foreignId("location_id")
                ->constrained()
                ->onDelete("cascade");
            $table->foreignId("product_id")->constrained()->onDelete("cascade");
            $table->decimal("quantity", 15, 4)->default(0.0);
            $table->timestamps();

            $table->unique(["user_id", "location_id", "product_id"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("sell_cart_items");
    }
};
