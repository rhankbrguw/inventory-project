import { Badge } from '@/components/ui/badge';
import UnifiedBadge from '@/components/UnifiedBadge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Package } from 'lucide-react';

export const productColumns = (t) => [
    {
        accessorKey: 'image_url',
        header: t('ui.table.image'),
        cell: ({ row }) => (
            <div className="flex justify-center">
                {row.image_url ? (
                    <img
                        src={row.image_url}
                        alt={row.name}
                        className="h-12 w-12 rounded-md object-cover"
                    />
                ) : (
                    <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                )}
            </div>
        ),
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'name',
        header: t('ui.table.product_name'),
        cell: ({ row }) => <p className="font-medium">{row.name}</p>,
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'classification',
        header: t('ui.table.classification'),
        cell: ({ row }) => {
            const status = row.classification || 'PENDING';

            let badgeClass = 'role-default';

            if (status === 'FAST MOVING') badgeClass = 'status-completed';
            if (status === 'SLOW MOVING')
                badgeClass = 'status-pending-approval';
            if (status === 'DEAD STOCK') badgeClass = 'status-rejected';

            return (
                <div className="flex justify-center">
                    <span className={`badge-base ${badgeClass}`}>{status}</span>
                </div>
            );
        },
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'sku',
        header: 'SKU',
        className: 'text-center font-mono text-xs whitespace-nowrap',
    },
    {
        accessorKey: 'type',
        header: t('ui.table.type'),
        cell: ({ row }) =>
            row.type?.name ? (
                <UnifiedBadge text={row.type.name} code={row.type.code} />
            ) : (
                '-'
            ),
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'status',
        header: t('ui.table.status'),
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Badge variant={row.deleted_at ? 'destructive' : 'success'}>
                    {row.deleted_at ? t('ui.inactive') : t('ui.active')}
                </Badge>
            </div>
        ),
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'price',
        header: t('ui.table.price'),
        cell: ({ row }) => (
            <div className="flex flex-col items-center">
                <span>{formatCurrency(row.price)}</span>
                {row.has_local_price && (
                    <span className="text-[10px] text-muted-foreground font-normal">
                        ({t('ui.branch') || 'Cabang'})
                    </span>
                )}
            </div>
        ),
        className: 'text-center font-semibold whitespace-nowrap',
    },
];

export const topProductsColumns = (t) => [
    {
        accessorKey: 'rank',
        header: '#',
        cell: ({ index }) => index + 1,
        className:
            'text-center py-2 px-3 text-muted-foreground font-mono text-xs',
        headerClassName: 'text-center py-2 px-3 font-medium rounded-tl-lg',
    },
    {
        accessorKey: 'name',
        header: t('ui.table.product'),
        className: 'text-center py-2 px-2 font-medium',
        headerClassName: 'text-center py-2 px-2 font-medium',
    },
    {
        accessorKey: 'sku',
        header: 'SKU',
        className:
            'text-center py-2 px-2 text-xs text-muted-foreground font-mono',
        headerClassName: 'text-center py-2 px-2 font-medium',
    },
    {
        accessorKey: 'quantity',
        header: t('ui.table.qty'),
        cell: ({ row }) => (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-info/15 text-info">
                {formatNumber(row.quantity)}
            </span>
        ),
        className: 'text-center py-2 px-2',
        headerClassName: 'text-center py-2 px-2 font-medium',
    },
    {
        accessorKey: 'revenue',
        header: t('ui.table.sales_value'),
        cell: ({ row }) => formatCurrency(row.revenue),
        className: 'text-center py-2 px-3 font-medium text-success',
        headerClassName: 'text-center py-2 px-3 font-medium rounded-tr-lg',
    },
];
