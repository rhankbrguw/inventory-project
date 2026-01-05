import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { router } from '@inertiajs/react';

export default function DataTable({
    columns,
    data,
    actions,
    showRoute,
    showRouteKey = 'id',
    rowClassName,
    footer,
    keyExtractor = (row) => row.id,
}) {
    const handleRowClick = (row) => {
        if (showRoute) {
            router.get(route(showRoute, row[showRouteKey]));
        }
    };

    return (
        <div className="bg-card text-card-foreground shadow-sm sm:rounded-lg">
            <ScrollArea className="w-full">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead
                                    key={
                                        col.accessorKey || col.id || col.header
                                    }
                                    className={col.className}
                                >
                                    {col.header}
                                </TableHead>
                            ))}
                            {actions && (
                                <TableHead className="text-center w-[100px]">
                                    {' '}
                                    Aksi
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow
                                key={keyExtractor(row)}
                                onClick={() => handleRowClick(row)}
                                className={`${
                                    showRoute ? 'cursor-pointer' : ''
                                } ${rowClassName ? rowClassName(row) : ''}`}
                            >
                                {columns.map((col) => (
                                    <TableCell
                                        key={
                                            col.accessorKey ||
                                            col.id ||
                                            col.header
                                        }
                                        className={col.className}
                                    >
                                        {col.cell
                                            ? col.cell({ row })
                                            : row[col.accessorKey]}
                                    </TableCell>
                                ))}
                                {actions && (
                                    <TableCell
                                        className="text-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {actions(row)}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                    {footer}
                </Table>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
