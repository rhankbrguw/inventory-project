import { Badge } from '@/components/ui/badge';
import { formatDate, formatNumber, formatTime } from '@/lib/utils';
import { Link } from '@inertiajs/react';

export const stockMovementPreviewColumns = (t) => [
    {
        accessorKey: 'created_at_time', header: t('ui.table.time'),
        cell: ({ row }) => <div><div>{formatDate(row.created_at)}</div><div className="text-muted-foreground">{formatTime(row.created_at)}</div></div>,
        className: 'text-center text-xs whitespace-nowrap',
    },
    {
        accessorKey: 'type', header: t('ui.table.type'),
        cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.type.replace('_', ' ')}</Badge>,
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'reference', header: t('ui.table.reference'),
        cell: ({ row }) => {
            const ref = row.reference;
            if (!ref || !ref.code) return <span className="text-muted-foreground">-</span>;
            if (ref.url && ref.url !== '#') return <Link href={ref.url} className="text-foreground hover:underline" onClick={(e) => e.stopPropagation()}>{ref.code}</Link>;
            return <span>{ref.code}</span>;
        },
        className: 'text-center font-mono text-xs whitespace-nowrap',
    },
    {
        accessorKey: 'notes', header: t('ui.table.notes'),
        cell: ({ row }) => {
            const od = row.origin_destination;
            const label = (od?.type && t(`ui.${od.type}`)) ? t(`ui.${od.type}`) : (od?.label || '');
            if (od && od.name && od.name !== '-') return <div className="flex flex-col items-center"><span className="text-[10px] text-muted-foreground">{label}</span><span>{od.name}</span></div>;
            return row.notes || '-';
        },
        className: 'text-center text-xs whitespace-nowrap',
    },
    {
        accessorKey: 'quantity', header: t('ui.table.change'),
        cell: ({ row }) => <span className={row.quantity > 0 ? 'text-success' : 'text-destructive'}>{row.quantity > 0 ? '+' : ''}{formatNumber(row.quantity)}</span>,
        className: 'text-center font-semibold whitespace-nowrap',
    },
];
