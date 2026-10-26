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
            $table->foreignId('received_by')
                ->nullable()
                ->after('updated_at')
                ->constrained('users')
                ->onDelete('restrict');
        });

        Schema::table('stock_transfers', function (Blueprint $table) {
            $table->timestamp('received_at')
                ->nullable()
                ->after('received_by');
        });
    }

    public function down(): void
    {
        Schema::table('stock_transfers', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['received_by']);
            }
            $table->dropColumn(['received_by', 'received_at']);
        });
    }
};
