<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('stock_transfers', function (Blueprint $table) {
            if (!Schema::hasColumn('stock_transfers', 'received_by')) {
                $table->foreignId('received_by')->nullable()->after('updated_at')->constrained('users')->onDelete('restrict');
            }

            if (!Schema::hasColumn('stock_transfers', 'received_at')) {
                $table->timestamp('received_at')->nullable()->after('received_by');
            }

            if (!Schema::hasColumn('stock_transfers', 'rejected_by')) {
                $table->foreignId('rejected_by')->nullable()->after('received_at')->constrained('users')->onDelete('restrict');
            }

            if (!Schema::hasColumn('stock_transfers', 'rejected_at')) {
                $table->timestamp('rejected_at')->nullable()->after('rejected_by');
            }

            if (!Schema::hasColumn('stock_transfers', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('rejected_at');
            }
        });
    }

    public function down(): void
    {
    }
};
