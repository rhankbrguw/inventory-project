import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import UnifiedBadge from '@/components/UnifiedBadge';

export const sellDetailColumns = (t) => [
    {
        accessorKey: 'product.name',
        header: t('ui.table.item_name'),
        cell: ({ row }) => {
            const productName = row.product?.name || row.product_name || t('ui.deleted_product');
            const unit = row.product?.unit || row.unit;
            return (
                <div className={cn('text-center', row.product?.deleted_at && 'text-muted-foreground')}>
                    <div className="font-medium text-xs sm:text-sm leading-tight text-foreground">{productName}</div>
                    {unit && <div className="text-[10px] text-muted-foreground mt-0.5">{t('ui.unit')}: {unit}</div>}
                    {row.product?.deleted_at && <span className="text-[10px] text-destructive">({t('ui.inactive')})</span>}
                </div>
            );
        },
        className: 'text-center min-w-[150px]',
    },
    {
        accessorKey: 'product.sku',
        header: 'SKU',
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.product?.sku || '-'}</span>,
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'channel_name',
        header: t('ui.table.channel'),
        cell: ({ row }) => {
            if (!row.channel_name || row.channel_name === '-') return <span className="text-muted-foreground text-xs">-</span>;
            return <UnifiedBadge text={row.channel_name} />;
        },
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'quantity',
        header: t('ui.table.qty'),
        cell: ({ row }) => {
            const qty = Math.abs(row.quantity || 0);
            const unit = row.product?.unit || row.unit || '';
            return <span className="text-xs sm:text-sm font-semibold">{formatNumber(qty)} {unit}</span>;
        },
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'average_cost_per_unit',
        header: t('ui.table.cost_modal'),
        cell: ({ row }) => <span className="text-xs sm:text-sm text-muted-foreground font-mono">{formatCurrency(row.average_cost_per_unit || 0)}</span>,
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'cost_per_unit',
        header: t('ui.table.sell_price'),
        cell: ({ row }) => <span className="text-xs sm:text-sm font-mono text-foreground font-medium">{formatCurrency(row.sell_price || row.cost_per_unit || row.price || 0)}</span>,
        className: 'text-center whitespace-nowrap',
    },
    {
        id: 'margin',
        header: t('ui.table.margin'),
        cell: ({ row }) => {
            const quantity = Math.abs(row.quantity || 0);
            const sellPrice = row.sell_price || row.cost_per_unit || row.price || 0;
            const avgCost = row.average_cost_per_unit || 0;
            const margin = row.margin !== undefined ? row.margin : (sellPrice - avgCost) * quantity;
            return <span className={cn('text-xs sm:text-sm font-mono font-semibold', margin >= 0 ? 'text-success' : 'text-destructive')}>{formatCurrency(margin)}</span>;
        },
        className: 'text-center whitespace-nowrap',
    },
    {
        id: 'total',
        header: t('ui.table.total_sale'),
        cell: ({ row }) => {
            const quantity = Math.abs(row.quantity || 0);
            const sellPrice = row.sell_price || row.cost_per_unit || row.price || 0;
            const total = row.total || row.subtotal || quantity * sellPrice;
            return <span className="text-xs sm:text-sm font-mono font-bold text-foreground">{formatCurrency(total)}</span>;
        },
        className: 'text-center whitespace-nowrap',
    },
];
