<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();

            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('location_id')->constrained('locations')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');

            $table->nullableMorphs('reference');

            $table->string('type')->index();
            $table->decimal('quantity', 15, 4);
            $table->decimal('cost_per_unit', 15, 2)->nullable();
            $table->decimal('average_cost_per_unit', 15, 2)->default(0);

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'location_id']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
