<?php

namespace App\Models;

use App\Traits\ScopedByLocation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;
    use ScopedByLocation;

    protected $fillable = [
        'type_id',
        'location_id',
        'supplier_id',
        'user_id',
        'reference_code',
        'transaction_date',
        'total_cost',
        'status',
        'notes',
        'payment_method_type_id',
        'installment_terms',
        'payment_status',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'total_cost' => 'decimal:2',
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethodType(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'payment_method_type_id');
    }

    public function stockMovements(): MorphMany
    {
        return $this->morphMany(StockMovement::class, 'reference');
    }

    public function installments(): MorphMany
    {
        return $this->morphMany(Installment::class, 'installmentable');
    }

    public function hasInstallments(): bool
    {
        return $this->installment_terms > 1;
    }

    public function isFullyPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function isPending(): bool
    {
        return $this->payment_status === 'pending';
    }

    public function isPartiallyPaid(): bool
    {
        return $this->payment_status === 'partial';
    }
}
