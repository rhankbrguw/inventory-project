<?php

namespace App\Notifications\Concerns;

trait FormatsNotificationContent
{
    protected function formatQty(float|int|string $quantity): string
    {
        $float = (float) $quantity;

        return (int) $float == $float
            ? number_format($float, 0, ',', '.')
            : number_format($float, 2, ',', '.');
    }

    protected function formatCurrency(float|int|string $amount): string
    {
        return 'Rp '.number_format((float) $amount, 0, ',', '.');
    }

    protected function formatItemsSummary($items): string
    {
        $list = $items->take(5)->map(function ($i) {
            $name = $i->product?->name ?? 'Produk';
            $unit = $i->product?->unit ?? 'Unit';
            $rawQty = $i->quantity ?? 0;
            $qty = $this->formatQty(abs((float) $rawQty));

            return "• {$name}: {$qty} {$unit}";
        })->join("\n");

        if ($items->count() > 5) {
            $list .= "\n_".__('notifications.and_more', ['count' => $items->count() - 5]).'_';
        }

        return $list;
    }
}
