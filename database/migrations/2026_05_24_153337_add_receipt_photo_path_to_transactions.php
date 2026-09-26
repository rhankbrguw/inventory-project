<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->string('receipt_photo_path')->nullable()->after('status');
        });

        Schema::table('sells', function (Blueprint $table) {
            $table->string('receipt_photo_path')->nullable()->after('status');
        });

        Schema::table('stock_transfers', function (Blueprint $table) {
            $table->string('receipt_photo_path')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn('receipt_photo_path');
        });

        Schema::table('sells', function (Blueprint $table) {
            $table->dropColumn('receipt_photo_path');
        });

        Schema::table('stock_transfers', function (Blueprint $table) {
            $table->dropColumn('receipt_photo_path');
        });
    }
};
