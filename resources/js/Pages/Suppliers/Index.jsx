import { Link, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import IndexPageLayout from "@/Components/IndexPageLayout";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import Pagination from "@/Components/Pagination";

const TABLE_COLUMNS = [
    {
        key: "name",
        label: "Nama Supplier",
        align: "center",
        className: "font-medium",
    },
    {
        key: "contact_person",
        label: "Koordinator",
        align: "center",
    },
    {
        key: "email",
        label: "Email",
        align: "center",
        className: "text-muted-foreground",
    },
    {
        key: "phone",
        label: "Telepon",
        align: "center",
    },
    {
        key: "actions",
        label: "Aksi",
        align: "center",
    },
];

const getAlignmentClass = (align) => {
    const alignmentMap = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    };
    return alignmentMap[align] || "text-left";
};

const sortOptions = [
    { value: "name_asc", label: "Nama (A-Z)" },
    { value: "name_desc", label: "Nama (Z-A)" },
];

export default function Index({ auth, suppliers, filters = {} }) {
    const [search, setSearch] = useState(filters.search || "");
    const [sort, setSort] = useState(filters.sort || "name_asc");
    const [debouncedSearch] = useDebounce(search, 500);
    const [confirmingSupplierDeletion, setConfirmingSupplierDeletion] =
        useState(null);

    useEffect(() => {
        if (debouncedSearch !== (filters.search || "")) {
            handleFilterChange({ search: debouncedSearch });
        }
    }, [debouncedSearch]);

    const handleFilterChange = (newFilter) => {
        const currentParams = {
            search: search || undefined,
            sort: sort,
            ...newFilter,
        };
        router.get(route("suppliers.index"), currentParams, {
            preserveState: true,
            replace: true,
        });
    };

    const deleteSupplier = () => {
        router.delete(route("suppliers.destroy", confirmingSupplierDeletion), {
            preserveScroll: true,
            onSuccess: () => setConfirmingSupplierDeletion(null),
        });
    };

    const renderActionDropdown = (supplier) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <Link href={route("suppliers.edit", supplier.id)}>
                    <DropdownMenuItem className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => setConfirmingSupplierDeletion(supplier.id)}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const renderCellContent = (column, supplier) => {
        switch (column.key) {
            case "name":
                return supplier.name;
            case "contact_person":
                return supplier.contact_person || "-";
            case "email":
                return supplier.email || "-";
            case "phone":
                return supplier.phone || "-";
            case "actions":
                return renderActionDropdown(supplier);
            default:
                return "";
        }
    };

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Supplier"
            createRoute="suppliers.create"
            buttonLabel="Tambah Supplier"
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-6">
                        <Input
                            type="search"
                            placeholder="Cari nama, koordinator, atau email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-auto sm:flex-grow"
                        />
                        <Select
                            value={sort}
                            onValueChange={(value) => {
                                setSort(value);
                                handleFilterChange({ sort: value });
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Urutkan" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <div className="md:hidden space-y-4">
                    {suppliers.data.map((supplier) => (
                        <Card key={supplier.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {supplier.name}
                                </CardTitle>
                                {renderActionDropdown(supplier)}
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {supplier.contact_person || "No contact"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {supplier.email || "-"} |{" "}
                                    {supplier.phone || "-"}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="hidden md:block bg-card text-card-foreground shadow-sm sm:rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {TABLE_COLUMNS.map((column) => (
                                    <TableHead
                                        key={column.key}
                                        className={getAlignmentClass(
                                            column.align
                                        )}
                                    >
                                        {column.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers.data.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    {TABLE_COLUMNS.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            className={`${getAlignmentClass(
                                                column.align
                                            )} ${column.className || ""}`}
                                        >
                                            {renderCellContent(
                                                column,
                                                supplier
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {suppliers.data.length > 0 && (
                    <Pagination links={suppliers.meta.links} />
                )}
            </div>

            <AlertDialog
                open={confirmingSupplierDeletion !== null}
                onOpenChange={() => setConfirmingSupplierDeletion(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan
                            menghapus data supplier secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteSupplier}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Hapus Supplier
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </IndexPageLayout>
    );
}
