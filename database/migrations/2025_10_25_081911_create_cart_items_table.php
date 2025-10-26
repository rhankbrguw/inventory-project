<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create("cart_items", function (Blueprint $table) {
            $table->id();
            $table->foreignId("user_id")->constrained()->onDelete("cascade");
            $table->foreignId("product_id")->constrained()->onDelete("cascade");
            $table
                ->foreignId("supplier_id")
                ->constrained()
                ->onDelete("cascade");
            $table->decimal("quantity", 15, 4)->default(0.0);
            $table->timestamps();

            $table->unique(["user_id", "product_id", "supplier_id"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("cart_items");
    }
};
