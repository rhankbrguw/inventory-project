<?php

namespace App\Domains\Inventory\Enums;

enum MovementType: string
{
    case IN = 'IN';
    case OUT = 'OUT';
    case ADJUSTMENT = 'ADJUSTMENT';
    case TRANSFER = 'TRANSFER';

    public function isAdditive(): bool
    {
        return $this === self::IN || $this === self::ADJUSTMENT; // Assuming ADJUSTMENT can be both, but we'll refine this later if needed. For now, IN is strictly additive for WAC.
    }
}
