import { Card } from '@/components/ui/card';
import { formatNumber, formatDate, cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

/**
 * Activity row for the dashboard Recent Activity panel.
 *
 * Layout: [icon] [product name + type·date] [qty + unit]
 *
 * The right column (qty/unit) is flex-shrink-0 so it never gets clipped.
 * The center column is min-w-0 so it truncates gracefully instead of pushing
 * the qty column off-screen on narrow viewports.
 */
export default function DashboardMobileCard({ movement, compact = false }) {
    const { t } = useTranslation();
    const isPositive = movement.quantity > 0;

    const typeLabel = t(`ui.movement_types.${movement.type}`) ?? movement.type;

    const Wrapper       = compact ? 'div' : Card;
    const wrapperClass  = compact
        ? 'border-b last:border-0 py-2.5 first:pt-0'
        : 'hover:bg-muted/20 transition-colors mb-2';

    return (
        <Wrapper className={wrapperClass}>
            <div className={cn('flex items-center gap-3', !compact && 'p-3')}>
                {/* Direction indicator icon */}
                <div
                    className={cn(
                        'flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center',
                        isPositive
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                    )}
                >
                    {isPositive
                        ? <ArrowUpRight className="h-4 w-4" />
                        : <ArrowDownLeft className="h-4 w-4" />
                    }
                </div>

                {/* Center: product name + type · date — truncates gracefully */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground leading-none mb-0.5">
                        {movement.product?.name || t('ui.product_deleted')}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                        <span className="font-medium text-foreground/70 truncate">
                            {typeLabel}
                        </span>
                        <span className="flex-shrink-0">·</span>
                        <span className="flex-shrink-0">
                            {formatDate(movement.created_at)}
                        </span>
                    </div>
                </div>

                {/* Right: quantity + unit — never shrinks, never clips */}
                <div className="flex-shrink-0 text-right ml-1">
                    <div
                        className={cn(
                            'text-sm font-bold tabular-nums leading-none',
                            isPositive ? 'text-success' : 'text-destructive'
                        )}
                    >
                        {isPositive ? '+' : ''}{formatNumber(movement.quantity)}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        {movement.product?.unit || 'unit'}
                    </p>
                </div>
            </div>
        </Wrapper>
    );
}
