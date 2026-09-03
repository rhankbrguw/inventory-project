import { formatCurrency, formatNumber, cn } from '@/lib/utils';

export const purchaseDetailColumns = (t) => [
    {
        accessorKey: 'product.name',
        header: t('ui.table.product'),
        cell: ({ row }) => (
            <div className={cn('text-center', row.product?.deleted_at && 'text-muted-foreground')}>
                <div className="font-medium text-xs sm:text-sm leading-tight text-foreground">{row.product?.name || t('ui.deleted_product')}</div>
                {row.product?.deleted_at && <span className="text-[10px] text-destructive">({t('ui.inactive')})</span>}
            </div>
        ),
        className: 'text-center min-w-[150px]',
    },
    {
        accessorKey: 'product.sku',
        header: 'SKU',
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.product?.sku || '-'}</span>,
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'quantity',
        header: t('ui.table.amount'),
        cell: ({ row }) => <span className="text-xs sm:text-sm font-semibold">{formatNumber(row.quantity)} {row.product?.unit || ''}</span>,
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'cost_per_unit',
        header: t('ui.table.cost_price'),
        cell: ({ row }) => <span className="text-xs sm:text-sm font-mono text-muted-foreground">{formatCurrency(row.cost_per_unit)}</span>,
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'subtotal',
        header: t('ui.table.subtotal'),
        cell: ({ row }) => <span className="text-xs sm:text-sm font-mono font-bold text-foreground">{formatCurrency(row.quantity * row.cost_per_unit)}</span>,
        className: 'text-center whitespace-nowrap',
    },
];
