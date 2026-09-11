import {
    TrendingUp,
    Package,
    Receipt,
    ShoppingCart,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import DailySalesChart from './DailySalesChart';
import TopProductsTable from './TopProductsTable';
import useTranslation from '@/hooks/useTranslation';
import StatCard from '@/pages/Dashboard/Partials/StatCard';

export default function ReportContent({ stats, charts }) {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                <StatCard
                    title={t('ui.total_sales')}
                    value={formatCurrency(stats.total_sales)}
                    subtext={t('ui.transaction_count', {
                        count: formatNumber(stats.transaction_count),
                    })}
                    icon={Receipt}
                    iconBg="bg-success/10"
                    iconColor="text-success"
                    valueColor="text-success"
                />
                <StatCard
                    title={t('ui.items_sold')}
                    value={formatNumber(stats.total_items_sold)}
                    subtext={t('ui.total_units')}
                    icon={Package}
                    iconBg="bg-info/10"
                    iconColor="text-info"
                />
                <StatCard
                    title={t('ui.avg_transaction')}
                    value={formatCurrency(stats.average_transaction)}
                    subtext={t('ui.per_order')}
                    icon={TrendingUp}
                    iconBg="bg-primary/10"
                    iconColor="text-primary"
                />
                <StatCard
                    title={t('ui.total_transactions')}
                    value={formatNumber(stats.transaction_count)}
                    subtext={t('ui.total_orders')}
                    icon={ShoppingCart}
                    iconBg="bg-highlight/10"
                    iconColor="text-highlight"
                />
            </div>

            <DailySalesChart data={charts.daily_trend} />

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <TopProductsTable data={charts.top_products} />
            </div>
        </div>
    );
}
