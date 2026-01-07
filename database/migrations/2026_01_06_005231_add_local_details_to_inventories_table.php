<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->decimal('selling_price', 15, 2)->nullable()->after('average_cost')
                ->comment('Harga jual khusus lokasi ini. Null = ikut harga global.');

            $table->foreignId('local_supplier_id')->nullable()->after('selling_price')
                ->constrained('suppliers')->nullOnDelete()
                ->comment('Supplier preferensi untuk lokasi ini.');

            $table->decimal('low_stock_threshold', 15, 4)->default(10)->after('quantity')
                ->comment('Batas minimum stok untuk trigger alert di lokasi ini.');

            $table->string('bin_location')->nullable()->after('low_stock_threshold')
                ->comment('Kode lokasi rak/bin penyimpanan.');
        });
    }

    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropForeign(['local_supplier_id']);
            $table->dropColumn(['selling_price', 'local_supplier_id', 'low_stock_threshold', 'bin_location']);
        });
    }
};
