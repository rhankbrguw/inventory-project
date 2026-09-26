import UnifiedBadge from '@/components/UnifiedBadge';
import UserLocationsCell from '@/pages/Users/Partials/UserLocationsCell';

export const userColumns = (t) => [
    {
        accessorKey: 'name',
        header: t('ui.table.name'),
        className: 'text-center font-medium whitespace-nowrap',
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
        accessorKey: 'role.code',
        header: t('ui.table.code'),
        cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground">
                {row.role?.code || '-'}
            </span>
        ),
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'role',
        header: t('ui.table.position'),
        cell: ({ row }) => (
            <UnifiedBadge text={row.role?.name} level={row.role?.level} />
        ),
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'locations',
        header: t('ui.location'),
        cell: ({ row }) => <UserLocationsCell user={row} t={t} />,
        className: 'text-center',
    },
];
