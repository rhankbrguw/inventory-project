<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::create('sell_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('sell_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('product_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('sales_channel_type_id')
                ->nullable()
                ->constrained('types')
                ->nullOnDelete();

            $table->decimal('quantity', 15, 4);
            $table->decimal('sell_price', 15, 2);
            $table->decimal('cost_per_unit', 15, 2)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sell_items');
    }
};
