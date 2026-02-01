<?php

namespace App\Models;

use App\Traits\ScopedByLocation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;
    use ScopedByLocation;

    public const STATUS_PENDING_APPROVAL = 'Pending Approval';
    public const STATUS_APPROVED = 'On Process';
    public const STATUS_COMPLETED = 'Completed';
    public const STATUS_REJECTED = 'Rejected';

    protected $fillable = [
        'type_id',
        'location_id',
        'from_location_id',
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
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason'
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'total_cost' => 'decimal:2',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(Type::class);
    }
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
    public function fromLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'from_location_id');
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
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
    public function rejector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }
    public function stockMovements(): MorphMany
    {
        return $this->morphMany(StockMovement::class, 'reference');
    }
    public function installments(): MorphMany
    {
        return $this->morphMany(Installment::class, 'installmentable');
    }
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
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
    public function isInternal(): bool
    {
        return !is_null($this->from_location_id);
    }
}
