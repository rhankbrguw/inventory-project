<?php

namespace App\Models;

use App\Traits\ScopedByLocation;
use App\Models\SellItem;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Model;

class Sell extends Model
{
    use HasFactory;
    use ScopedByLocation;

    public const STATUS_PENDING_APPROVAL = 'Pending Approval';
    public const STATUS_APPROVED = 'Approved';
    public const STATUS_SHIPPING = 'Shipping';
    public const STATUS_COMPLETED = 'Completed';
    public const STATUS_REJECTED = 'Rejected';

    protected $fillable = [
        'type_id',
        'location_id',
        'customer_id',
        'target_location_id',
        'sales_channel_type_id',
        'user_id',
        'reference_code',
        'transaction_date',
        'total_price',
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

    public function targetLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'target_location_id');
    }

    public function salesChannel(): BelongsTo
    {
        return $this->belongsTo(Type::class, 'sales_channel_type_id');
    }

    public function items()
    {
        return $this->hasMany(SellItem::class);
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

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function isInterBranchSale(): bool
    {
        return !empty($this->target_location_id);
    }

    public function getDestinationLocationId(): ?int
    {
        return $this->target_location_id ?? $this->customer?->related_location_id;
    }
}
