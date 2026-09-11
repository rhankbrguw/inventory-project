import { Badge } from '@/components/ui/badge';
import UnifiedBadge from '@/components/UnifiedBadge';
import { formatGroupName } from '@/lib/utils';

import LocationOfficersCell from '@/pages/Locations/Partials/LocationOfficersCell';

export const locationColumns = (t) => [
    {
        accessorKey: 'name',
        header: t('ui.table.location_name'),
        className: 'text-center font-medium whitespace-nowrap',
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
        accessorKey: 'users',
        header: t('ui.table.officers'),
        cell: ({ row }) => <LocationOfficersCell users={row.users} t={t} />,
        className: 'text-center',
    },
    {
        accessorKey: 'status',
        header: t('ui.table.status'),
        cell: ({ row }) => (
            <Badge variant={row.deleted_at ? 'destructive' : 'success'}>
                {row.deleted_at ? t('ui.inactive') : t('ui.active')}
            </Badge>
        ),
        className: 'text-center whitespace-nowrap',
    },
];

export const typeColumns = (t) => [
    {
        accessorKey: 'group',
        header: t('ui.table.group'),
        cell: ({ row }) => formatGroupName(row.group),
        className: 'text-center font-medium whitespace-nowrap',
    },
    {
        accessorKey: 'name',
        header: t('ui.table.name'),
        cell: ({ row }) => (
            <UnifiedBadge text={row.name} code={row.code} />
        ),
        className: 'text-center whitespace-nowrap',
    },
    {
        accessorKey: 'code',
        header: t('ui.table.code'),
        cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground">
                {row.code || '-'}
            </span>
        ),
        className: 'text-center whitespace-nowrap',
    },
];
