<?php

namespace App\Models;

use App\Traits\ClearsDashboardCache;
use App\Traits\ScopedByLocation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class StockMovement extends Model
{
    use ClearsDashboardCache, HasFactory, ScopedByLocation;

    protected $fillable = [
        'product_id',
        'location_id',
        'user_id',
        'sales_channel_type_id',
        'type',
        'quantity',
        'cost_per_unit',
        'average_cost_per_unit',
        'reference_type',
        'reference_id',
        'date',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public const TYPE_PURCHASE = 'purchase';

    public const TYPE_SELL = 'sell';

    public const TYPE_ADJUSTMENT = 'adjustment';

    public const TYPE_TRANSFER_IN = 'transfer_in';

    public const TYPE_TRANSFER_OUT = 'transfer_out';

    public static function getMovementTypes(): array
    {
        return [
            ['value' => self::TYPE_PURCHASE, 'label' => __('ui.movement_purchase')],
            ['value' => self::TYPE_SELL, 'label' => __('ui.movement_sell')],
            ['value' => self::TYPE_ADJUSTMENT, 'label' => __('ui.movement_adjustment')],
            ['value' => self::TYPE_TRANSFER_IN, 'label' => __('ui.movement_transfer_in')],
            ['value' => self::TYPE_TRANSFER_OUT, 'label' => __('ui.movement_transfer_out')],
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    public function salesChannel(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'sales_channel_type_id');
    }
}
