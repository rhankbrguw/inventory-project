<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'supplier_id',
        'location_id',
        'user_id',
        'type',
        'reason',
        'quantity',
        'cost_per_unit',
        'notes',
        'reference_id',
        'reference_type',
    ];

    public static function getMovementTypes(): array
    {
        return [
            ['value' => 'purchase', 'label' => 'Pembelian'],
            ['value' => 'adjustment', 'label' => 'Penyesuaian'],
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
