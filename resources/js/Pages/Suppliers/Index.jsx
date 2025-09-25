import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { supplierColumns } from "@/Constants/tableColumns";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DeleteConfirmationDialog from "@/Components/DeleteConfirmationDialog";
import DataTable from "@/Components/DataTable";
import MobileCardList from "@/Components/MobileCardList";
import SupplierMobileCard from "./Partials/SupplierMobileCard";
import Pagination from "@/Components/Pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Edit, Trash2, MoreVertical } from "lucide-react";

const sortOptions = [
    { value: "name_asc", label: "Nama (A-Z)" },
    { value: "name_desc", label: "Nama (Z-A)" },
];

export default function Index({ auth, suppliers, filters = {} }) {
    const { params, setFilter } = useIndexPageFilters(
        "suppliers.index",
        filters,
        "name_asc"
    );
    const [confirmingSupplierDeletion, setConfirmingSupplierDeletion] =
        useState(null);

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
                            value={params.search || ""}
                            onChange={(e) =>
                                setFilter("search", e.target.value)
                            }
                            className="w-full sm:w-auto sm:flex-grow"
                        />
                        <Select
                            value={params.sort || "name_asc"}
                            onValueChange={(value) => setFilter("sort", value)}
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

                <MobileCardList
                    data={suppliers.data}
                    renderItem={(supplier) => (
                        <SupplierMobileCard
                            key={supplier.id}
                            supplier={supplier}
                            renderActionDropdown={renderActionDropdown}
                        />
                    )}
                />

                <div className="hidden md:block bg-card text-card-foreground shadow-sm sm:rounded-lg overflow-x-auto">
                    <DataTable
                        columns={supplierColumns}
                        data={suppliers.data}
                        actions={renderActionDropdown}
                    />
                </div>

                {suppliers.data.length > 0 && (
                    <Pagination links={suppliers.meta.links} />
                )}
            </div>

            <DeleteConfirmationDialog
                open={confirmingSupplierDeletion !== null}
                onOpenChange={() => setConfirmingSupplierDeletion(null)}
                onConfirm={deleteSupplier}
                confirmText="Hapus Supplier"
                description="Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data supplier secara permanen."
            />
        </IndexPageLayout>
    );
}
