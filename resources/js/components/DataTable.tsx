import type * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { router } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import useTranslation from '@/hooks/useTranslation';

export type TableRowData = Record<string, unknown> & {
    id?: string | number;
    unique_key?: string | number;
};

export type DataTableColumn<Row extends TableRowData> = {
    id?: string;
    accessorKey?: string;
    header: React.ReactNode;
    className?: string;
    headerClassName?: string;
    cell?: (context: { row: Row }) => React.ReactNode;
};

export type DataTableProps<Row extends TableRowData> = {
    columns: DataTableColumn<Row>[];
    data: Row[];
    actions?: ((row: Row) => React.ReactNode) | null;
    showRoute?: string | null;
    showRouteKey?: string;
    onRowClick?: (row: Row) => void;
    rowClassName?: (row: Row) => string;
    footer?: React.ReactNode;
    keyExtractor?: (row: Row) => string | number | null | undefined;
    emptyIcon?: React.ComponentType<{ className?: string }>;
    emptyTitle?: string;
    emptyDescription?: string;
    isFiltered?: boolean;
};

function DataTableRow<Row extends TableRowData>({
    row, columns, actions, showRoute, rowClassName, onRowClick,
}: Pick<DataTableProps<Row>, 'columns' | 'actions' | 'showRoute' | 'rowClassName' | 'onRowClick'> & { row: Row }) {
    const isClickable = Boolean(showRoute || onRowClick);

    return (
        <TableRow onClick={() => onRowClick?.(row)} className={`${isClickable ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''} ${rowClassName ? rowClassName(row) : ''}`}>
            {columns.map((col) => (
                <TableCell key={String(col.accessorKey ?? col.id ?? col.header)} className={col.className}>
                    {col.cell ? col.cell({ row }) : col.accessorKey ? String(row[col.accessorKey] ?? '') : null}
                </TableCell>
            ))}
            {actions && <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>{actions(row)}</TableCell>}
        </TableRow>
    );
}

function DataTableEmpty({ totalCols, emptyIcon, title, description }: { totalCols: number; emptyIcon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
    return (
        <TableRow>
            <TableCell colSpan={totalCols} className="h-56 text-center">
                <EmptyState icon={emptyIcon} title={title} description={description} />
            </TableCell>
        </TableRow>
    );
}

export default function DataTable<Row extends TableRowData>({
    columns, data, actions, showRoute, showRouteKey = 'id', onRowClick,
    rowClassName, footer, keyExtractor = (row: Row) => row.id ?? row.unique_key ?? null,
    emptyIcon = Inbox, emptyTitle, emptyDescription, isFiltered = false,
}: DataTableProps<Row>) {
    const { t } = useTranslation();
    const handleRowClick = (row: Row) => {
        if (onRowClick) { onRowClick(row); return; }
        if (showRoute) router.get(route(showRoute, row[showRouteKey] as string | number));
    };
    const totalCols = columns.length + (actions ? 1 : 0);
    const title = emptyTitle || (isFiltered ? t('ui.no_matching_records') : t('ui.no_data'));
    const desc = emptyDescription || (isFiltered ? t('ui.no_matching_records_desc') : t('ui.no_data_desc'));

    return (
        <div className="bg-card text-card-foreground shadow-sm sm:rounded-lg">
            <ScrollArea className="w-full">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={String(col.accessorKey ?? col.id ?? col.header)} className={col.headerClassName || 'text-center whitespace-nowrap'}>{col.header}</TableHead>
                            ))}
                            {actions && <TableHead className="text-center w-[100px]">{t('ui.actions')}</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((row, idx) => (
                                <DataTableRow
                                    key={keyExtractor(row) ?? row.unique_key ?? row.id ?? String(idx)}
                                    row={row} columns={columns} actions={actions} showRoute={showRoute}
                                    rowClassName={rowClassName} onRowClick={handleRowClick}
                                />
                            ))
                        ) : (
                            <DataTableEmpty totalCols={totalCols} emptyIcon={emptyIcon} title={title} description={desc} />
                        )}
                    </TableBody>
                    {footer}
                </Table>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
