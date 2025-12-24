<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('reference_code')->unique();
            $table->foreignId('from_location_id')->constrained('locations')->onDelete('restrict');
            $table->foreignId('to_location_id')->constrained('locations')->onDelete('restrict');
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->date('transfer_date');
            $table->text('notes')->nullable();
            $table->string('status');
            $table->timestamps();
            $table->foreignId('received_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->timestamp('received_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transfers');
    }
};
