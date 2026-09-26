<?php

namespace App\Enums;

enum TransactionType: string
{
    case PURCHASE = 'purchase';
    case SELL = 'sell';
    case TRANSFER = 'transfer';
    case ADJUSTMENT = 'adjustment';

    public function code(): string
    {
        return match ($this) {
            self::PURCHASE => 'PB',
            self::SELL => 'PJ',
            self::TRANSFER => 'TF',
            self::ADJUSTMENT => 'PY',
        };
    }
}
