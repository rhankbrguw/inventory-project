<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_transfers', function (Blueprint $table) {
            $table->foreignId('rejected_by')->nullable()->after('received_at')->constrained('users')->onDelete('restrict');
        });
        Schema::table('stock_transfers', function (Blueprint $table) {
            $table->timestamp('rejected_at')->nullable()->after('rejected_by');
        });
        Schema::table('stock_transfers', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('rejected_at');
        });
    }

    public function down(): void
    {
        Schema::table('stock_transfers', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['rejected_by']);
            }
            $table->dropColumn(['rejected_by', 'rejected_at', 'rejection_reason']);
        });
    }
};
