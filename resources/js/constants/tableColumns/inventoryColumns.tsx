import {
    formatRelativeTime,
    formatNumber,
} from '@/lib/utils';
import { Package, Warehouse } from 'lucide-react';

export const stockColumns = (t) => [
    {
        accessorKey: 'product.name',
        header: t('ui.table.item_name'),
        cell: ({ row }) => row.product?.name || t('ui.deleted_product'),
        className: 'text-center font-medium whitespace-nowrap px-4',
    },
    {
        accessorKey: 'product.sku',
        header: 'SKU',
        cell: ({ row }) => row.product?.sku || '-',
        className: 'text-center font-mono text-xs whitespace-nowrap px-4',
    },
    {
        accessorKey: 'location.name',
        header: t('ui.table.location'),
        cell: ({ row }) => {
            const location = row.location;
            const isWarehouse = location?.type?.name === 'Warehouse';
            return (
                <div className="flex items-center justify-center">
                    {isWarehouse ? (
                        <Warehouse className="w-4 h-4 mr-2 text-muted-foreground" />
                    ) : (
                        <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                    )}
                    {location?.name || t('ui.deleted_location')}
                </div>
            );
        },
        className: 'text-center whitespace-nowrap px-4',
    },
    {
        accessorKey: 'updated_at',
        header: t('ui.table.last_activity'),
        cell: ({ row }) => formatRelativeTime(row.updated_at),
        className: 'text-center whitespace-nowrap px-4',
    },
    {
        accessorKey: 'quantity',
        header: t('ui.table.quantity'),
        cell: ({ row }) => {
            const item = row;
            const displayQuantity = Math.max(0, parseFloat(item.quantity || 0));
            return (
                <span>
                    {formatNumber(displayQuantity)}{' '}
                    <span className="text-muted-foreground text-xs">
                        {item.product?.unit}
                    </span>
                </span>
            );
        },
        className: 'text-center font-semibold whitespace-nowrap px-4',
    },
];


