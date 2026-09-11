import { formatCurrency, formatDate } from '@/lib/utils';
import UnifiedBadge from '@/components/UnifiedBadge';
import { Link } from '@inertiajs/react';

export const transactionColumns = (t) => [
    {
        accessorKey: 'reference_code',
        header: t('ui.table.reference'),
        cell: ({ row }) => (
            <Link
                href={row.url}
                className="text-primary hover:underline font-mono text-xs whitespace-nowrap"
            >
                {row.reference_code}
            </Link>
        ),
        className: 'text-center',
    },
    {
        accessorKey: 'type',
        header: t('ui.table.type'),
        cell: ({ row }) => (
            <UnifiedBadge
                text={t(`ui.${row.type?.toLowerCase()}`) || row.type}
                code={row.type}
            />
        ),
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'location',
        header: t('ui.table.location'),
        cell: ({ row }) => row.location || '-',
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'party_name',
        header: t('ui.table.supplier_customer'),
        cell: ({ row }) => row.party_name || '-',
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'transaction_date',
        header: t('ui.table.date'),
        cell: ({ row }) => formatDate(row.transaction_date),
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'total_amount',
        header: t('ui.table.total'),
        cell: ({ row }) => formatCurrency(row.total_amount),
        className: 'text-center font-semibold whitespace-nowrap',
    },
    {
        accessorKey: 'user',
        header: t('ui.table.pic'),
        cell: ({ row }) => row.user || '-',
        className: 'text-center whitespace-nowrap',
    },
];


