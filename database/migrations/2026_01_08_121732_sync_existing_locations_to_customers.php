<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Location;
use App\Models\Customer;
use App\Models\Type;

return new class () extends Migration {
    public function up(): void
    {
        $typeCabang = Type::where('group', 'customer_type')
            ->where('code', 'CBG')
            ->first();

        $typeId = $typeCabang ? $typeCabang->id : null;

        $locations = Location::all();

        foreach ($locations as $loc) {
            $exists = Customer::where('related_location_id', $loc->id)->exists();

            if (!$exists) {
                $locType = Type::find($loc->type_id);
                if ($locType && $locType->code === 'WH') {
                    continue;
                }

                Customer::create([
                    'name'                => $loc->name . ' (Internal)',
                    'type_id'             => $typeId,
                    'related_location_id' => $loc->id,
                    'email'               => 'branch.' . $loc->id . '@internal.system',
                    'phone'               => null,
                    'address'             => $loc->address ?? 'Internal Location',
                ]);
            }
        }
    }

    public function down(): void
    {
        //
    }
};
