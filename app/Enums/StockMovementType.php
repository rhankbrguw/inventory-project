<?php

namespace App\Enums;

enum StockMovementType: string
{
    case PURCHASE = 'purchase';
    case SELL = 'sell';
    case TRANSFER_IN = 'transfer_in';
    case TRANSFER_OUT = 'transfer_out';
    case ADJUSTMENT_IN = 'adjustment_in';
    case ADJUSTMENT_OUT = 'adjustment_out';

    public function isAddition(): bool
    {
        return in_array($this, [self::PURCHASE, self::TRANSFER_IN, self::ADJUSTMENT_IN], true);
    }
}
