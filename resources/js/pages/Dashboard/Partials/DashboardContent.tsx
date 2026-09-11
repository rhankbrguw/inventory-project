import {
    DollarSign,
    Package,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';
import SalesVsPurchasesChart from './SalesVsPurchasesChart';
import StatCard from './StatCard';
import ActivityList from './ActivityList';
import TopProductsChart from './TopProductsChart';
import PaymentMethodsChart from './PaymentMethodsChart';
import QuickStatsCard from './QuickStatsCard';

export default function DashboardContent({
    stats,
    charts,
    recentMovements,
    dateRangeLabel,
}: {
    stats: any;
    charts: any;
    recentMovements: any;
    dateRangeLabel?: string;
}) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                <StatCard
                    title={t('ui.revenue')}
                    value={formatCurrency(stats.revenue)}
                    subtext={t('ui.transaction_count', {
                        count: formatNumber(stats.sales_count),
                    })}
                    icon={DollarSign}
                    iconBg="bg-primary/10"
                    iconColor="text-primary"
                />
                <StatCard
                    title={t('ui.net_profit')}
                    value={formatCurrency(stats.net_profit)}
                    subtext={t('ui.margin_label', {
                        value: stats.gross_margin.toFixed(1),
                    })}
                    icon={stats.net_profit >= 0 ? TrendingUp : TrendingDown}
                    iconBg={
                        stats.net_profit >= 0
                            ? 'bg-success/10'
                            : 'bg-destructive/10'
                    }
                    iconColor={
                        stats.net_profit >= 0
                            ? 'text-success'
                            : 'text-destructive'
                    }
                    valueColor={
                        stats.net_profit >= 0
                            ? 'text-success'
                            : 'text-destructive'
                    }
                />
                <StatCard
                    title={t('ui.purchases_label')}
                    value={formatCurrency(stats.total_purchases)}
                    subtext={t('ui.transaction_count', {
                        count: formatNumber(stats.purchase_count),
                    })}
                    icon={ShoppingCart}
                    iconBg="bg-warning/10"
                    iconColor="text-warning"
                />
                <StatCard
                    title={t('ui.stock_value')}
                    value={formatCurrency(stats.inventory_value)}
                    subtext={
                        stats.low_stock_count > 0
                            ? t('ui.items_need_restock', {
                                count: formatNumber(stats.low_stock_count),
                            })
                            : t('ui.all_stock_normal')
                    }
                    icon={stats.low_stock_count > 0 ? AlertTriangle : Package}
                    iconBg={
                        stats.low_stock_count > 0
                            ? 'bg-warning/10'
                            : 'bg-info/10'
                    }
                    iconColor={
                        stats.low_stock_count > 0 ? 'text-warning' : 'text-info'
                    }
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3 items-stretch">
                <SalesVsPurchasesChart 
                    data={charts.comparison} 
                    dateRangeLabel={dateRangeLabel} 
                />

                <ActivityList data={recentMovements.data} t={t} />
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                <TopProductsChart data={charts.top_items} t={t} />
                <PaymentMethodsChart data={charts.channels} t={t} />
                <QuickStatsCard
                    stats={stats}
                    dateRangeLabel={dateRangeLabel}
                    t={t}
                />
            </div>
        </div>
    );
}
