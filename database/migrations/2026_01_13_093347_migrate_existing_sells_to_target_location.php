<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class () extends Migration {
    public function up(): void
    {
        DB::table('sells')
            ->whereNotNull('customer_id')
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('customers')
                    ->whereColumn('customers.id', 'sells.customer_id')
                    ->whereNotNull('customers.related_location_id');
            })
            ->chunkById(100, function ($sells) {
                foreach ($sells as $sell) {
                    $relatedLocationId = DB::table('customers')
                        ->where('id', $sell->customer_id)
                        ->value('related_location_id');

                    if ($relatedLocationId) {
                        DB::table('sells')
                            ->where('id', $sell->id)
                            ->update(['target_location_id' => $relatedLocationId]);
                    }
                }
            });
    }

    public function down(): void
    {
        DB::table('sells')->update(['target_location_id' => null]);
    }
};
