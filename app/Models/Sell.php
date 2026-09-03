<?php

namespace App\Models;

use App\Traits\ClearsDashboardCache;
use App\Traits\HasInstallmentPayments;
use App\Traits\ScopedByLocation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Sell extends Model
{
    use ClearsDashboardCache, HasFactory, HasInstallmentPayments, ScopedByLocation;

    public const STATUS_PENDING_APPROVAL = 'Pending Approval';

    public const STATUS_APPROVED = 'On Process';

    public const STATUS_SHIPPING = 'Shipping';

    public const STATUS_COMPLETED = 'Completed';

    public const STATUS_REJECTED = 'Rejected';

    public const PAYMENT_PENDING = 'pending';

    public const PAYMENT_PAID = 'paid';

    public const PAYMENT_PARTIAL = 'partial';

    public const PREFIX = 'SL-';

    protected $fillable = [
        'type_id', 'location_id', 'customer_id', 'target_location_id', 'sales_channel_type_id',
        'user_id', 'reference_code', 'transaction_date', 'total_price', 'status', 'notes',
        'payment_method_type_id', 'installment_terms', 'interest_rate', 'payment_status',
        'approved_by', 'approved_at', 'rejected_by', 'rejected_at', 'rejection_reason',
        'receipt_photo_path',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'total_price' => 'decimal:2',
        'interest_rate' => 'decimal:4',
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

    public function items(): HasMany
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

    public function interestAmount(): float
    {
        return round((float) $this->total_price * ((float) $this->interest_rate / 100) * $this->installment_terms, 2);
    }

    public function totalPayable(): float
    {
        return round((float) $this->total_price + $this->interestAmount(), 2);
    }

    public function isInterBranchSale(): bool
    {
        return ! empty($this->target_location_id);
    }

    public function getDestinationLocationId(): ?int
    {
        return $this->target_location_id;
    }
}
