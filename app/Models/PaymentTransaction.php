<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PaymentTransaction extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_SETTLEMENT = 'settlement';

    public const STATUS_CAPTURE = 'capture';

    public const STATUS_DENY = 'deny';

    public const STATUS_EXPIRE = 'expire';

    public const STATUS_CANCEL = 'cancel';

    protected $fillable = [
        'payable_type',
        'payable_id',
        'order_id',
        'driver',
        'snap_token',
        'payment_url',
        'payment_type',
        'gross_amount',
        'status',
        'settlement_time',
        'raw_response',
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'settlement_time' => 'datetime',
        'raw_response' => 'array',
    ];

    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    public function isSuccess(): bool
    {
        return in_array($this->status, [self::STATUS_SETTLEMENT, self::STATUS_CAPTURE]);
    }
}
