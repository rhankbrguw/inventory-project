<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds a per-transaction flat interest rate to both purchases and sells.
 *
 * interest_rate is stored as a percentage (e.g. 2.0 = 2%/month).
 * Defaults to 0.0000 which preserves zero-interest behavior for existing data.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->decimal('interest_rate', 8, 4)
                ->default(0.0000)
                ->after('installment_terms')
                ->comment('Flat monthly interest rate in percent (0 = no interest)');
        });

        Schema::table('sells', function (Blueprint $table) {
            $table->decimal('interest_rate', 8, 4)
                ->default(0.0000)
                ->after('installment_terms')
                ->comment('Flat monthly interest rate in percent (0 = no interest)');
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn('interest_rate');
        });

        Schema::table('sells', function (Blueprint $table) {
            $table->dropColumn('interest_rate');
        });
    }
};
