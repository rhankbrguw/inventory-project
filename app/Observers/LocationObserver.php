<?php

namespace App\Observers;

use App\Models\Customer;
use App\Models\Location;
use App\Models\Type;

class LocationObserver
{
    public function created(Location $location): void
    {
        $this->syncCustomer($location);
    }

    public function updated(Location $location): void
    {
        $this->syncCustomer($location);
    }

    private function syncCustomer(Location $location)
    {
        $branchType = Type::where('group', Type::GROUP_LOCATION)
            ->where('code', Location::CODE_BRANCH)
            ->first();

        if (!$branchType || $location->type_id != $branchType->id) {
            return;
        }

        $customerType = Type::where('group', Type::GROUP_CUSTOMER)
            ->where('code', Customer::CODE_BRANCH_CUSTOMER)
            ->first();

        if (!$customerType) {
            return;
        }

        Customer::updateOrCreate(
            ['related_location_id' => $location->id],
            [
                'name' => $location->name . ' (Internal)',
                'type_id' => $customerType->id,
                'email' => 'branch.' . $location->id . '@internal.system',
                'phone' => null,
                'address' => $location->address,
            ]
        );
    }
}
