import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { router } from "@inertiajs/react";

export default function DataTable({
    columns,
    data,
    actions,
    showRoute,
    showRouteKey = "id",
}) {
    const handleRowClick = (row) => {
        if (showRoute) {
            router.get(route(showRoute, row[showRouteKey]));
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {columns.map((col) => (
                        <TableHead
                            key={col.accessorKey}
                            className={col.className}
                        >
                            {col.header}
                        </TableHead>
                    ))}
                    {actions && (
                        <TableHead className="text-center">Aksi</TableHead>
                    )}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((row) => (
                    <TableRow
                        key={row.id}
                        onClick={() => handleRowClick(row)}
                        className={showRoute ? "cursor-pointer" : ""}
                    >
                        {columns.map((col) => (
                            <TableCell
                                key={col.accessorKey}
                                className={col.className}
                            >
                                {col.cell
                                    ? col.cell({ row })
                                    : row[col.accessorKey]}
                            </TableCell>
                        ))}
                        {actions && (
                            <TableCell className="text-center">
                                {actions(row)}
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
