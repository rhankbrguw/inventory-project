<?php

namespace App\Models;

use App\Traits\ScopedByLocation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Model;

class Sell extends Model
{
    use HasFactory;
    use ScopedByLocation;

    protected $fillable = [
        'type_id',
        'location_id',
        'customer_id',
        'user_id',
        'reference_code',
        'transaction_date',
        'total_price',
        'status',
        'payment_method_type_id',
        'notes',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'total_price' => 'decimal:2',
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'payment_method_type_id');
    }

    public function stockMovements(): MorphMany
    {
        return $this->morphMany(StockMovement::class, 'reference');
    }
}
