<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case DRAFT = 'Draft';
    case PENDING_APPROVAL = 'Pending Approval';
    case APPROVED = 'On Process';
    case SHIPPING = 'Shipping';
    case COMPLETED = 'Completed';
    case REJECTED = 'Rejected';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::PENDING_APPROVAL => 'Pending Approval',
            self::APPROVED => 'On Process',
            self::SHIPPING => 'Shipping',
            self::COMPLETED => 'Completed',
            self::REJECTED => 'Rejected',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::COMPLETED, self::REJECTED], true);
    }
}
