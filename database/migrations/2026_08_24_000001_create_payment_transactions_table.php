<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->morphs('payable');
            $table->string('order_id')->unique();
            $table->string('driver')->default('midtrans');
            $table->string('snap_token')->nullable();
            $table->string('payment_url', 500)->nullable();
            $table->string('payment_type')->nullable();
            $table->decimal('gross_amount', 15, 2);
            $table->string('status')->default('pending');
            $table->timestamp('settlement_time')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamps();

            $table->index(['status', 'driver']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
