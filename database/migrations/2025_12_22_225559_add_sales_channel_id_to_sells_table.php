<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('sells', function (Blueprint $table) {
            $table->foreignId('sales_channel_id')->nullable()->after('customer_id')->constrained('sales_channels')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sells', function (Blueprint $table) {
            $table->dropForeign(['sales_channel_id']);
            $table->dropColumn('sales_channel_id');
        });
    }
};
