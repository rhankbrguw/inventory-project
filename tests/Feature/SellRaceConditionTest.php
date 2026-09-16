<?php

namespace Tests\Feature;

use App\Models\Inventory;
use App\Models\Location;
use App\Models\Product;
use App\Models\Role;
use App\Models\Type;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SellRaceConditionTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Location $branch;

    protected Product $product;

    protected Type $paymentMethod;

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
        $this->product = Product::create(['name' => 'Ayam Karkas', 'sku' => 'AYAM-001', 'type_id' => $productType->id, 'unit' => 'kg', 'price' => 35000, 'average_cost' => 28000]);
        Inventory::create(['product_id' => $this->product->id, 'location_id' => $this->branch->id, 'quantity' => 90, 'average_cost' => 28000]);

        $this->paymentMethod = Type::firstOrCreate(['code' => Type::CODE_PAYMENT_TUNAI], ['group' => Type::GROUP_PAYMENT, 'name' => 'Tunai']);
    }

    public function test_idempotency_lock_prevents_duplicate_checkout(): void
    {
        $idempKey = 'test-idemp-123';
        $lockKey = "sell_idemp_{$this->user->id}_{$idempKey}";
        $lock = Cache::lock($lockKey, 15);
        $lock->get();

        $payload = [
            'location_id' => $this->branch->id,
            'buyer_tab' => 'general',
            'transaction_date' => now()->toDateString(),
            'payment_method_type_id' => $this->paymentMethod->id,
            'installment_terms' => 1,
            'idempotency_key' => $idempKey,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 10,
                    'sell_price' => 35000,
                ],
            ],
        ];

        $response = $this->actingAs($this->user)->post(route('transactions.sells.store'), $payload);
        $response->assertSessionHasErrors('general');

        $lock->release();
    }

    public function test_stock_depletion_during_checkout_returns_validation_error(): void
    {
        Inventory::where('product_id', $this->product->id)
            ->where('location_id', $this->branch->id)
            ->update(['quantity' => 0]);

        $payload = [
            'location_id' => $this->branch->id,
            'buyer_tab' => 'general',
            'transaction_date' => now()->toDateString(),
            'payment_method_type_id' => $this->paymentMethod->id,
            'installment_terms' => 1,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 90,
                    'sell_price' => 35000,
                ],
            ],
        ];

        $response = $this->actingAs($this->user)->post(route('transactions.sells.store'), $payload);
        $response->assertSessionHasErrors();
    }
}
