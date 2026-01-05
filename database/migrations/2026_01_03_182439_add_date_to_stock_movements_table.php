<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class() extends Migration {
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            if (!Schema::hasColumn('stock_movements', 'date')) {
                $table->date('date')->nullable()->after('user_id');
            }
        });

        DB::statement("UPDATE stock_movements SET date = DATE(created_at) WHERE date IS NULL");
    }

    public function down(): void
    {
        // Cannot safely rollback - data migration already performed
        // Schema::dropColumn('date') would lose data
    }
};
