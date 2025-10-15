<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['purchase_id']);
            $table->renameColumn('purchase_id', 'reference_id');
            $table->string('reference_type')->nullable()->after('purchase_id');
        });

        DB::table('stock_movements')
            ->whereNotNull('reference_id')
            ->update(['reference_type' => \App\Models\Purchase::class]);
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropColumn('reference_type');
            $table->renameColumn('reference_id', 'purchase_id');
            $table->foreign('purchase_id')->references('id')->on('purchases')->onDelete('set null');
        });
    }
};
