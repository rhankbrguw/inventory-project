<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('stock_transfers', function (Blueprint $table) {
            $table->foreignId('received_by')
                ->nullable()
                ->after('updated_at')
                ->constrained('users')
                ->onDelete('restrict');

            $table->timestamp('received_at')
                ->nullable()
                ->after('received_by');
        });
    }

    public function down(): void
    {
        Schema::table('stock_transfers', function (Blueprint $table) {
            $table->dropForeign(['received_by']);
            $table->dropColumn(['received_by', 'received_at']);
        });
    }
};
