<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Type extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = ['name', 'group', 'code', 'level'];

    public const GROUP_PRODUCT = 'product_type';

    public const GROUP_SALES_CHANNEL = 'sales_channel';

    public const GROUP_USER_ROLE = 'user_role';

    public const GROUP_LOCATION = 'location_type';

    public const GROUP_TRANSACTION = 'transaction_type';

    public const GROUP_PAYMENT = 'payment_method';

    public const GROUP_CUSTOMER = 'customer_type';

    /** Location type levels — determines what transactions are allowed */
    public const LEVEL_STORAGE = 1;  // Warehouse/Gudang — can Purchase & Transfer-out

    public const LEVEL_SALES = 2;  // Branch/Outlet   — can Sell & Transfer-in

    public const CODE_TRANSACTION_PURCHASE = 'PB';

    public const CODE_TRANSACTION_SELL = 'PJ';

    public const CODE_TRANSACTION_ADJUSTMENT = 'PY';

    public const CODE_SALES_CHANNEL_CASH = 'CASH';

    public const CODE_PAYMENT_TUNAI = 'TUN';

    public static function getAvailableGroups(): array
    {
        return [
            self::GROUP_PRODUCT => ['label' => __('ui.type_group_product'), 'description' => __('ui.type_desc_product')],
            self::GROUP_SALES_CHANNEL => ['label' => __('ui.type_group_sales_channel'), 'description' => __('ui.type_desc_sales_channel')],
            self::GROUP_USER_ROLE => ['label' => __('ui.type_group_user_role'), 'description' => __('ui.type_desc_user_role')],
            self::GROUP_LOCATION => ['label' => __('ui.type_group_location'), 'description' => __('ui.type_desc_location')],
            self::GROUP_TRANSACTION => ['label' => __('ui.type_group_transaction'), 'description' => __('ui.type_desc_transaction')],
            self::GROUP_PAYMENT => ['label' => __('ui.type_group_payment_method'), 'description' => __('ui.type_desc_payment')],
            self::GROUP_CUSTOMER => ['label' => __('ui.type_group_customer'), 'description' => __('ui.type_desc_customer')],
        ];
    }

    public static function getAvailableLevels(): array
    {
        return [
            self::GROUP_USER_ROLE => [
                ['value' => 1, 'label' => __('ui.level_super_admin')],
                ['value' => 10, 'label' => __('ui.level_managerial')],
                ['value' => 20, 'label' => __('ui.level_operational')],
            ],
            self::GROUP_LOCATION => [
                ['value' => 1, 'label' => __('ui.level_storage')],
                ['value' => 2, 'label' => __('ui.level_sales')],
            ],
        ];
    }

    protected static function booted(): void
    {
        static::saved(fn ($type) => \Illuminate\Support\Facades\Cache::forget("types_grp_{$type->group}"));
        static::deleted(fn ($type) => \Illuminate\Support\Facades\Cache::forget("types_grp_{$type->group}"));
    }

    public static function getForGroup(string $group): \Illuminate\Database\Eloquent\Collection
    {
        return \Illuminate\Support\Facades\Cache::remember("types_grp_{$group}", 3600, fn () => static::where('group', $group)->orderBy('name')->get());
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'type_id');
    }
}
