<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::table('sells', function (Blueprint $table) {
            $table->foreignId('target_location_id')
                ->nullable()
                ->after('customer_id')
                ->constrained('locations')
                ->nullOnDelete();

            $table->index('target_location_id');
        });
    }

    public function down(): void
    {
        Schema::table('sells', function (Blueprint $table) {
            $table->dropForeign(['target_location_id']);
            $table->dropIndex(['target_location_id']);
            $table->dropColumn('target_location_id');
        });
    }
};
