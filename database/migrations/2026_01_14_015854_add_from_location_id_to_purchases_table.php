<?php

use App\Models\Location;
use App\Models\Purchase;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->foreignId('from_location_id')
                ->nullable()
                ->after('location_id')
                ->constrained('locations')
                ->nullOnDelete();
        });

        $oldPurchases = Purchase::where('notes', 'LIKE', '%Internal Transfer dari:%')->get();

        foreach ($oldPurchases as $purchase) {
            if (preg_match('/dari: (.*?) \(/', $purchase->notes, $matches)) {
                $locationName = $matches[1];

                $location = Location::where('name', $locationName)->first();

                if ($location) {
                    $purchase->update(['from_location_id' => $location->id]);
                }
            }
        }
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropForeign(['from_location_id']);
            $table->dropColumn('from_location_id');
        });
    }
};
