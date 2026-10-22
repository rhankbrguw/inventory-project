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

    protected function formatItemsSummary($items, int $max = 5): string
    {
        $list = $items->take($max)->map(function ($i) {
            $name = $i->product?->name ?? 'Produk';
            $unit = $i->product?->unit ?? 'Unit';
            $rawQty = $i->quantity ?? 0;
            $qty = $this->formatQty(abs((float) $rawQty));

            return "  • {$name}: *{$qty} {$unit}*";
        })->join("\n");

        if ($items->count() > $max) {
            $diff = $items->count() - $max;
            $list .= "\n  _".__('notifications.and_more', ['count' => $diff]).'_';
        }

        return $list;
    }

    protected function formatWaHeader(string $badgeText): string
    {
        $corp = __('notifications.corporate_header_title');

        return "*{$corp}*\n"
            ."━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            ."*{$badgeText}*\n"
            .'━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    }

    protected function formatWaKeyValues(array $rows, int $labelWidth = 16): string
    {
        $lines = [];
        foreach ($rows as $label => $val) {
            if ($val === null || $val === '') {
                continue;
            }
            $cleanLabel = (string) $label;
            $padded = str_pad(mb_substr($cleanLabel, 0, $labelWidth), $labelWidth, ' ');
            $lines[] = "{$padded} : {$val}";
        }

        return "```\n".implode("\n", $lines)."\n```";
    }

    protected function formatWaFooter(string $actionLabel, string $actionUrl): string
    {
        $note = __('notifications.corporate_footer_note');

        return "🔗 *{$actionLabel}*\n"
            ."{$actionUrl}\n\n"
            ."────────────────────────────\n"
            ."_{$note}_";
    }
}
