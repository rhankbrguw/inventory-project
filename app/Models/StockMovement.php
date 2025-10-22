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
        'location_id',
        'type',
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
            ['value' => 'sell', 'label' => 'Penjualan'],
            ['value' => 'adjustment', 'label' => 'Penyesuaian'],
            ['value' => 'transfer_in', 'label' => 'Transfer Masuk'],
            ['value' => 'transfer_out', 'label' => 'Transfer Keluar'],
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
}
