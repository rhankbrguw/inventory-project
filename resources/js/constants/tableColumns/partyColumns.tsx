import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import UnifiedBadge from '@/components/UnifiedBadge';

export const supplierColumns = (t) => [
    {
        accessorKey: 'name',
        header: t('ui.table.supplier_name'),
        cell: ({ row }) => (
            <div className="flex flex-col items-center">
                <span className="font-medium">{row.name}</span>
                <span className="text-[10px] text-muted-foreground">
                    {row.is_global ? (t('ui.global') || 'Global') : (t('ui.branch') || 'Cabang')}
                </span>
            </div>
        ),
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'contact_person',
        header: t('ui.table.coordinator'),
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'email',
        header: t('ui.table.email'),
        className: 'text-center text-muted-foreground whitespace-nowrap',
    },
    {
        accessorKey: 'phone',
        header: t('ui.table.phone'),
        cell: ({ row }) => {
            const phone = row.phone;
            if (!phone) return '-';
            return phone.replace(
                /(\+62|62)(\d{3})(\d{4})(\d+)/,
                '+62 $2-$3-$4'
            );
        },
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'status',
        header: t('ui.table.status'),
        cell: ({ row }) => (
            <Badge variant={row.deleted_at ? 'destructive' : 'success'}>
                {row.deleted_at ? t('ui.inactive') : t('ui.active')}
            </Badge>
        ),
        className: 'text-center',
    },
];

export const customerColumns = (t) => [
    {
        accessorKey: 'id',
        header: t('ui.id'),
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'name',
        header: t('ui.table.customer_name'),
        cell: ({ row }) => (
            <div className="flex flex-col items-center">
                <span className="font-medium">{row.name}</span>
                <span className="text-[10px] text-muted-foreground">
                    {row.is_global ? (t('ui.global') || 'Global') : (t('ui.branch') || 'Cabang')}
                </span>
            </div>
        ),
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'type',
        header: t('ui.table.customer_type'),
        cell: ({ row }) => <UnifiedBadge text={row.type?.name} />,
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'email',
        header: t('ui.table.email'),
        className: 'text-center text-muted-foreground whitespace-nowrap',
    },
    {
        accessorKey: 'phone',
        header: t('ui.table.phone'),
        cell: ({ row }) => {
            const phone = row.phone;
            if (!phone) return '-';
            return phone.replace(
                /(\+62|62)(\d{3})(\d{4})(\d+)/,
                '+62 $2-$3-$4'
            );
        },
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'created_at',
        header: t('ui.table.created_at'),
        cell: ({ row }) => formatDate(row.created_at),
        className: 'text-center whitespace-nowrap',
    },
];
