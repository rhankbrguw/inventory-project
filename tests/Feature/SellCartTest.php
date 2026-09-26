<?php

namespace Tests\Feature;

use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\ProductPrice;
use App\Models\Role;
use App\Models\SellCartItem;
use App\Models\Type;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SellCartTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Location $branch;

    protected Product $product;

    protected Type $salesChannelGoFood;

    protected function setUp(): void
    {
        parent::setUp();

        $branchType = Type::firstOrCreate(['code' => Location::CODE_BRANCH], ['group' => Type::GROUP_LOCATION, 'name' => 'Cabang']);
        $this->branch = Location::create(['name' => 'Store Jakarta', 'type_id' => $branchType->id, 'address' => 'Jakarta']);

        $superAdminRole = Role::firstOrCreate(['code' => Role::CODE_SUPER_ADMIN], ['name' => 'Super Admin', 'level' => Role::LEVEL_SUPER_ADMIN]);
        $this->user = User::factory()->create();
        $this->user->roles()->attach($superAdminRole->id);
        $this->user->locations()->attach($this->branch->id, ['role_id' => $superAdminRole->id]);

        $productType = Type::firstOrCreate(['code' => 'RAW'], ['group' => Type::GROUP_PRODUCT, 'name' => 'Raw Material']);
        $this->salesChannelGoFood = Type::firstOrCreate(['code' => 'GFD'], ['group' => Type::GROUP_SALES_CHANNEL, 'name' => 'GoFood']);

        $this->product = Product::create(['name' => 'Ayam Karkas', 'sku' => 'AYAM-001', 'type_id' => $productType->id, 'unit' => 'kg', 'price' => 30000]);
        ProductPrice::create(['product_id' => $this->product->id, 'type_id' => $this->salesChannelGoFood->id, 'price' => 35000]);
        Inventory::create(['product_id' => $this->product->id, 'location_id' => $this->branch->id, 'quantity' => 100, 'selling_price' => 32000]);
    }

    public function test_can_add_item_to_sell_cart(): void
    {
        $response = $this->actingAs($this->user)->post(route('sell.cart.store'), [
            'product_id' => $this->product->id,
            'location_id' => $this->branch->id,
            'quantity' => 2,
            'sell_price' => 32000,
            'sales_channel_id' => null,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('sell_cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'location_id' => $this->branch->id,
            'quantity' => 2,
        ]);
    }

    public function test_update_prices_by_channel_updates_cart_without_error(): void
    {
        SellCartItem::create([
            'user_id' => $this->user->id,
            'location_id' => $this->branch->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'sell_price' => 30000,
            'sales_channel_type_id' => null,
        ]);

        $response = $this->actingAs($this->user)->patch(route('sell.cart.update-prices'), [
            'location_id' => $this->branch->id,
            'sales_channel_id' => $this->salesChannelGoFood->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('sell_cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'sales_channel_type_id' => $this->salesChannelGoFood->id,
            'sell_price' => 35000,
        ]);
    }

    public function test_update_prices_by_channel_with_null_channel(): void
    {
        SellCartItem::create([
            'user_id' => $this->user->id,
            'location_id' => $this->branch->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'sell_price' => 35000,
            'sales_channel_type_id' => $this->salesChannelGoFood->id,
        ]);

        $response = $this->actingAs($this->user)->patch(route('sell.cart.update-prices'), [
            'location_id' => $this->branch->id,
            'sales_channel_id' => null,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('sell_cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'sales_channel_type_id' => null,
            'sell_price' => 32000,
        ]);
    }
}
