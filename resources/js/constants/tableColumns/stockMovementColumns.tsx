import { Badge } from '@/components/ui/badge';
import { formatDate, formatNumber, formatTime } from '@/lib/utils';
export { stockMovementPreviewColumns } from './stockMovementPreviewColumns';

export const stockMovementColumns = (t) => [
    {
        accessorKey: 'product.name', header: t('ui.table.product'),
        cell: ({ row }) => row.product?.name, className: 'font-medium text-center whitespace-nowrap',
    },
    {
        accessorKey: 'product.sku', header: 'SKU',
        cell: ({ row }) => row.product?.sku, className: 'font-mono text-center text-xs whitespace-nowrap',
    },
    {
        accessorKey: 'location.name', header: t('ui.table.location'),
        cell: ({ row }) => row.location?.name, className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'type', header: t('ui.table.type'),
        cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.type.replace('_', ' ')}</Badge>,
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'origin_destination', header: t('ui.table.remarks'),
        cell: ({ row }) => {
            const od = row.origin_destination;
            if (row.type === 'adjustment') return <span className="text-xs">{od?.name || '-'}</span>;
            const label = (od?.type && t(`ui.${od.type}`)) ? t(`ui.${od.type}`) : (od?.label || '');
            if (od?.name) return <div className="text-xs"><p className="text-muted-foreground">{label}</p><p className="font-medium">{od.name}</p></div>;
            return '-';
        },
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'quantity', header: t('ui.table.change'),
        cell: ({ row }) => <span className={row.quantity > 0 ? 'text-success' : 'text-destructive'}>{row.quantity > 0 ? '+' : ''}{formatNumber(row.quantity)}</span>,
        className: 'font-semibold text-center whitespace-nowrap',
    },
    {
        accessorKey: 'created_at', header: t('ui.table.time'),
        cell: ({ row }) => <div><div>{formatDate(row.created_at)}</div><div className="text-muted-foreground">{formatTime(row.created_at)}</div></div>,
        className: 'text-xs text-center whitespace-nowrap',
    },
];
