<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Installment extends Model
{
    use HasFactory;

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

    public function installmentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isOverdue(): bool
    {
        return $this->status === 'overdue' ||
            ($this->status === 'pending' && $this->due_date < now());
    }
}
