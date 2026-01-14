<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class () extends Migration {
    public function up(): void
    {
        $typeIds = DB::table('types')
            ->where('group', 'customer_type')
            ->where(function ($q) {
                $q->where('code', 'CBG')
                    ->orWhere('name', 'Cabang');
            })
            ->pluck('id')
            ->toArray();

        if (!empty($typeIds)) {
            DB::table('customers')->whereIn('type_id', $typeIds)->delete();

            DB::table('types')->whereIn('id', $typeIds)->delete();
        }
    }

    public function down(): void
    {
        //
    }
};
