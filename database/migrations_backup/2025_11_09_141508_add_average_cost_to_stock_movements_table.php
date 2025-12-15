<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->decimal('average_cost_per_unit', 15, 4)->default(0.0)->after('cost_per_unit');
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropColumn('average_cost_per_unit');
        });
    }
};
