<?php

namespace App\Exceptions;

class InsufficientStockException extends BusinessLogicException
{
    /**
     * Create a new exception instance.
     */
    public function __construct(string $productName = '', string $locationName = '', string $remaining = '')
    {
        if ($productName && $remaining !== '') {
            $message = __('messages.stock.insufficient_detail', [
                'product' => $productName,
                'remaining' => $remaining,
            ]);
        } elseif ($productName && $locationName) {
            $message = __('messages.stock.insufficient')." ({$productName} at {$locationName})";
        } else {
            $message = __('messages.stock.insufficient');
        }

        parent::__construct($message);
    }
}
