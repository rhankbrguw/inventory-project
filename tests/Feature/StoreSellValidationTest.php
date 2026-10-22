<?php

namespace Tests\Feature;

use App\Http\Requests\StoreSellRequest;
use App\Models\Location;
use App\Models\Type;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class StoreSellValidationTest extends TestCase
{
    use RefreshDatabase;

    protected Location $warehouse;

    protected Location $branchA;

    protected Location $branchB;

    protected function setUp(): void
    {
        parent::setUp();

        $warehouseType = Type::firstOrCreate(['code' => Location::CODE_WAREHOUSE], ['group' => Type::GROUP_LOCATION, 'name' => 'Gudang']);
        $branchType = Type::firstOrCreate(['code' => Location::CODE_BRANCH], ['group' => Type::GROUP_LOCATION, 'name' => 'Cabang']);

        $this->warehouse = Location::create(['name' => 'Main Warehouse', 'type_id' => $warehouseType->id, 'address' => 'Central']);
        $this->branchA = Location::create(['name' => 'Branch A', 'type_id' => $branchType->id, 'address' => 'North']);
        $this->branchB = Location::create(['name' => 'Branch B', 'type_id' => $branchType->id, 'address' => 'South']);
    }

    public function test_branch_to_branch_internal_sale_is_permitted(): void
    {
        $request = new StoreSellRequest;
        $request->merge([
            'location_id' => $this->branchA->id,
            'target_location_id' => $this->branchB->id,
            'customer_id' => null,
        ]);

        $validator = Validator::make($request->all(), []);
        $request->withValidator($validator);

        $this->assertFalse($validator->errors()->has('target_location_id'));
    }

    public function test_warehouse_cannot_serve_individual_customer(): void
    {
        $request = new StoreSellRequest;
        $request->merge([
            'location_id' => $this->warehouse->id,
            'customer_id' => 99,
            'target_location_id' => null,
        ]);

        $validator = Validator::make($request->all(), []);
        $request->withValidator($validator);

        $this->assertTrue($validator->errors()->has('customer_id'));
        $this->assertTrue($validator->errors()->has('target_location_id'));
    }

    public function test_same_source_and_destination_location_is_rejected(): void
    {
        $request = new StoreSellRequest;
        $request->merge([
            'location_id' => $this->branchA->id,
            'target_location_id' => $this->branchA->id,
            'customer_id' => null,
        ]);

        $validator = Validator::make($request->all(), []);
        $request->withValidator($validator);

        $this->assertTrue($validator->errors()->has('target_location_id'));
    }

    public function test_customer_and_target_location_cannot_both_be_provided(): void
    {
        $request = new StoreSellRequest;
        $request->merge([
            'location_id' => $this->branchA->id,
            'target_location_id' => $this->branchB->id,
            'customer_id' => 10,
        ]);

        $validator = Validator::make($request->all(), []);
        $request->withValidator($validator);

        $this->assertTrue($validator->errors()->has('customer_id'));
    }

    public function test_internal_sale_without_target_location_is_rejected(): void
    {
        $request = new StoreSellRequest;
        $request->merge([
            'location_id' => $this->branchA->id,
            'target_location_id' => null,
            'is_internal' => true,
        ]);

        $validator = Validator::make($request->all(), []);
        $request->withValidator($validator);

        $this->assertTrue($validator->errors()->has('target_location_id'));
    }

    public function test_customer_tab_without_customer_id_is_rejected(): void
    {
        $request = new StoreSellRequest;
        $request->merge([
            'location_id' => $this->branchA->id,
            'buyer_tab' => 'customer',
            'customer_id' => null,
        ]);

        $validator = Validator::make($request->all(), []);
        $request->withValidator($validator);

        $this->assertTrue($validator->errors()->has('customer_id'));
    }
}
