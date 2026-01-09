<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Location;
use App\Models\Customer;
use App\Models\Type;

class SyncInternalCustomers extends Command
{
    protected $signature = 'customers:sync-internal';
    protected $description = 'Sync internal customers for all branches';

    public function handle()
    {
        $customerTypeCabang = Type::where('group', Type::GROUP_CUSTOMER)
            ->where('code', Customer::CODE_BRANCH_CUSTOMER)
            ->first();

        $locationTypeBranch = Type::where('group', Type::GROUP_LOCATION)
            ->where('code', Location::CODE_BRANCH)
            ->first();

        if (!$customerTypeCabang || !$locationTypeBranch) {
            $this->error('Required types not found!');
            return 1;
        }

        $branches = Location::where('type_id', $locationTypeBranch->id)->get();
        $count = 0;

        Customer::withoutEvents(function () use ($branches, $customerTypeCabang, &$count) {
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
                $count++;
            }
        });

        $this->info("✓ Synced {$count} internal customers");
        return 0;
    }
}
