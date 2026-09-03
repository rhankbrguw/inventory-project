import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Percent, Receipt, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function QuickStatsCard({ stats, dateRangeLabel, t }) {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="pb-1 pt-3.5 px-4">
                <CardTitle className="text-sm font-semibold">
                    {t('ui.quick_summary')}
                </CardTitle>
                <CardDescription className="text-xs">
                    {t('ui.metrics_period', { period: dateRangeLabel })}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-1.5 pt-1 pb-3 px-4">
                <QuickStatItem
                    icon={Receipt}
                    label={t('ui.total_transactions')}
                    value={formatNumber(stats.sales_count + stats.purchase_count)}
                    subvalue={t('ui.sell_buy_count', { sell: formatNumber(stats.sales_count), buy: formatNumber(stats.purchase_count) })}
                    iconBg="bg-highlight/10"
                    iconColor="text-highlight"
                />
                <QuickStatItem
                    icon={Percent}
                    label={t('ui.gross_margin')}
                    value={`${stats.gross_margin.toFixed(1)}%`}
                    subvalue={t('ui.from_sales')}
                    iconBg={stats.gross_margin > 20 ? 'bg-success/10' : 'bg-muted'}
                    iconColor={
                        stats.gross_margin > 20
                            ? 'text-success'
                            : 'text-muted-foreground'
                    }
                />
                <QuickStatItem
                    icon={Package}
                    label={t('ui.stock_asset_value')}
                    value={formatCurrency(stats.inventory_value)}
                    subvalue={
                        stats.low_stock_count > 0
                            ? t('ui.items_need_restock', { count: formatNumber(stats.low_stock_count) })
                            : t('ui.all_stock_normal')
                    }
                    iconBg={
                        stats.low_stock_count > 0 ? 'bg-warning/10' : 'bg-info/10'
                    }
                    iconColor={
                        stats.low_stock_count > 0 ? 'text-warning' : 'text-info'
                    }
                />
                <QuickStatItem
                    icon={stats.net_profit >= 0 ? TrendingUp : TrendingDown}
                    label={t('ui.net_profit')}
                    value={formatCurrency(stats.net_profit)}
                    subvalue={t('ui.after_cogs')}
                    iconBg={
                        stats.net_profit >= 0
                            ? 'bg-success/10'
                            : 'bg-destructive/10'
                    }
                    iconColor={
                        stats.net_profit >= 0 ? 'text-success' : 'text-destructive'
                    }
                />
            </CardContent>
        </Card>
    );
}

const QuickStatItem = ({
    icon: Icon,
    label,
    value,
    subvalue,
    iconBg,
    iconColor,
}) => (
    <div className="flex items-center gap-2.5 py-1 border-b last:border-0">
        <div className={`p-1.5 rounded-md flex-shrink-0 ${iconBg}`}>
            <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="min-w-0 mr-2">
                <p className="text-[11px] text-muted-foreground truncate">{label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{subvalue}</p>
            </div>
            <p className="text-xs sm:text-sm font-bold flex-shrink-0 tabular-nums tracking-tight text-right ml-2 truncate" title={String(value)}>{value}</p>
        </div>
    </div>
);
