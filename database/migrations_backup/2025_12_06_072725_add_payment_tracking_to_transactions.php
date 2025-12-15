<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->integer('installment_terms')->default(1)->after('payment_method_type_id');
            $table->string('payment_status')->default('pending')->after('installment_terms');
        });

        Schema::table('sells', function (Blueprint $table) {
            $table->integer('installment_terms')->default(1)->after('payment_method_type_id');
            $table->string('payment_status')->default('pending')->after('installment_terms');
        });

        Schema::create('installments', function (Blueprint $table) {
            $table->id();
            $table->morphs('installmentable');
            $table->integer('installment_number');
            $table->decimal('amount', 15, 2);
            $table->date('due_date');
            $table->string('status')->default('pending');
            $table->date('paid_date')->nullable();
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('installments');

        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn(['installment_terms', 'payment_status']);
        });

        Schema::table('sells', function (Blueprint $table) {
            $table->dropColumn(['installment_terms', 'payment_status']);
        });
    }
};
