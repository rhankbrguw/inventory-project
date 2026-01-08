<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Location;
use App\Models\Customer;
use App\Models\Type;

return new class() extends Migration {
    public function up(): void
    {
        $customerTypeCabang = Type::where('group', Type::GROUP_CUSTOMER)
            ->where('code', Customer::CODE_BRANCH_CUSTOMER)
            ->first();

        $locationTypeBranch = Type::where('group', Type::GROUP_LOCATION)
            ->where('code', Location::CODE_BRANCH)
            ->first();

        if (!$customerTypeCabang || !$locationTypeBranch) {
            return;
        }

        $branches = Location::where('type_id', $locationTypeBranch->id)->get();

        Customer::withoutEvents(function () use ($branches, $customerTypeCabang) {
            foreach ($branches as $branch) {
                Customer::updateOrCreate(
                    ['related_location_id' => $branch->id],
                    [
                        'name' => $branch->name . ' (Internal)',
                        'type_id' => $customerTypeCabang->id,
                        'email' => 'branch.' . $branch->id . '@internal.system',
                        'phone' => null,
                        'address' => $branch->address,
                    ]
                );
            }
        });
    }

    public function down(): void
    {
        //
    }
};
