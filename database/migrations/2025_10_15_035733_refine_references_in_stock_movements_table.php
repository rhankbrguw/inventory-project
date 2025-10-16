<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['purchase_id']);
            $table->renameColumn('purchase_id', 'reference_id');
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->string('reference_type')->nullable()->after('reference_id');
        });

        DB::table('stock_movements')
            ->whereNotNull('reference_id')
            ->update(['reference_type' => \App\Models\Purchase::class]);
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            DB::table('stock_movements')
                ->where('reference_type', '!=', \App\Models\Purchase::class)
                ->update(['reference_id' => null, 'reference_type' => null]);

            $table->dropColumn('reference_type');
            $table->renameColumn('reference_id', 'purchase_id');
            $table->foreign('purchase_id')->references('id')->on('purchases')->onDelete('set null');
        });
    }
};
