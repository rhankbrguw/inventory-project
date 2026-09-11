<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Type;
use App\Rules\ValidRoleForLocationType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role as SpatieRole;
use Tests\TestCase;

class LocationAssignmentRoleTest extends TestCase
{
    use RefreshDatabase;

    protected Type $warehouseType;

    protected Type $branchType;

    protected SpatieRole $cashierRole;

    protected SpatieRole $whManagerRole;

    protected SpatieRole $branchManagerRole;

    protected SpatieRole $staffRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->warehouseType = Type::firstOrCreate(['code' => 'WH'], ['group' => Type::GROUP_LOCATION, 'name' => 'Warehouse', 'level' => Type::LEVEL_STORAGE]);
        $this->branchType = Type::firstOrCreate(['code' => 'BR'], ['group' => Type::GROUP_LOCATION, 'name' => 'Branch', 'level' => Type::LEVEL_SALES]);

        $this->cashierRole = SpatieRole::firstOrCreate(['name' => 'Cashier', 'guard_name' => 'web'], ['code' => Role::CODE_CASHIER, 'level' => Role::THRESHOLD_STAFF]);
        $this->whManagerRole = SpatieRole::firstOrCreate(['name' => 'Warehouse Manager', 'guard_name' => 'web'], ['code' => Role::CODE_WAREHOUSE_MGR, 'level' => Role::THRESHOLD_MANAGERIAL]);
        $this->branchManagerRole = SpatieRole::firstOrCreate(['name' => 'Branch Manager', 'guard_name' => 'web'], ['code' => Role::CODE_BRANCH_MGR, 'level' => Role::THRESHOLD_MANAGERIAL]);
        $this->staffRole = SpatieRole::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web'], ['code' => Role::CODE_STAFF, 'level' => Role::THRESHOLD_STAFF]);
    }

    public function test_cashier_cannot_be_assigned_to_warehouse(): void
    {
        $validator = Validator::make(
            ['type_id' => $this->warehouseType->id, 'role_id' => $this->cashierRole->id],
            ['role_id' => [new ValidRoleForLocationType]]
        );

        $this->assertTrue($validator->fails());
    }

    public function test_branch_manager_cannot_be_assigned_to_warehouse(): void
    {
        $validator = Validator::make(
            ['type_id' => $this->warehouseType->id, 'role_id' => $this->branchManagerRole->id],
            ['role_id' => [new ValidRoleForLocationType]]
        );

        $this->assertTrue($validator->fails());
    }

    public function test_warehouse_manager_cannot_be_assigned_to_branch(): void
    {
        $validator = Validator::make(
            ['type_id' => $this->branchType->id, 'role_id' => $this->whManagerRole->id],
            ['role_id' => [new ValidRoleForLocationType]]
        );

        $this->assertTrue($validator->fails());
    }

    public function test_cashier_can_be_assigned_to_branch(): void
    {
        $validator = Validator::make(
            ['type_id' => $this->branchType->id, 'role_id' => $this->cashierRole->id],
            ['role_id' => [new ValidRoleForLocationType]]
        );

        $this->assertFalse($validator->fails());
    }
}
