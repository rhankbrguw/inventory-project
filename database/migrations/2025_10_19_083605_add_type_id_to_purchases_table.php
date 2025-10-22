<?php

use App\Models\Type;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table
                ->foreignId('type_id')
                ->after('id')
                ->nullable()
                ->constrained('types')
                ->nullOnDelete();
        });

        $purchaseType = Type::where('group', Type::GROUP_TRANSACTION)
            ->where('name', 'Pembelian')
            ->first();
        if ($purchaseType) {
            \App\Models\Purchase::query()->update(['type_id' => $purchaseType->id]);
        }
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropForeign(['type_id']);
            $table->dropColumn('type_id');
        });
    }
};
