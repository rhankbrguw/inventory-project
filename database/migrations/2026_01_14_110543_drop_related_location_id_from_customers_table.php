<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['related_location_id']);
            $table->dropColumn('related_location_id');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('related_location_id')
                ->nullable()
                ->after('type_id')
                ->constrained('locations')
                ->nullOnDelete();
        });
    }
};
