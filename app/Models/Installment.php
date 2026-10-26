<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Installment extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_PAID = 'paid';

    public const STATUS_OVERDUE = 'overdue';

    protected $fillable = [
        'installmentable_type',
        'installmentable_id',
        'installment_number',
        'amount',
        'due_date',
        'status',
        'paid_date',
        'paid_amount',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_date' => 'date',
    ];

    protected $appends = [
        'is_paid',
        'is_overdue',
    ];

    public function installmentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isOverdue(): bool
    {
        return $this->status === self::STATUS_OVERDUE ||
            ($this->status === self::STATUS_PENDING && $this->due_date < now());
    }

    public function getIsPaidAttribute(): bool
    {
        return $this->isPaid();
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->isOverdue();
    }
}
