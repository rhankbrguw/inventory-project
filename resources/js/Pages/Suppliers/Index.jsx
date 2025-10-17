import { Link, router } from "@inertiajs/react";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { useSoftDeletes } from "@/Hooks/useSoftDeletes";
import { supplierColumns } from "@/Constants/tableColumns.jsx";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DeleteConfirmationDialog from "@/Components/DeleteConfirmationDialog";
import DataTable from "@/Components/DataTable";
import MobileCardList from "@/Components/MobileCardList";
import SupplierMobileCard from "./Partials/SupplierMobileCard";
import Pagination from "@/Components/Pagination";
import SupplierFilterCard from "./Partials/SupplierFilterCard";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import { Edit, MoreVertical, Archive, ArchiveRestore } from "lucide-react";

export default function Index({ auth, suppliers, filters = {} }) {
    const { params, setFilter } = useIndexPageFilters(
        "suppliers.index",
        filters,
        "name_asc"
    );

    const {
        confirmingDeletion,
        setConfirmingDeletion,
        isProcessing,
        itemToDeactivate,
        deactivateItem,
        restoreItem,
    } = useSoftDeletes({ resourceName: "suppliers", data: suppliers.data });

    const renderActionDropdown = (supplier) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() =>
                        router.get(route("suppliers.edit", supplier.id))
                    }
                >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                {supplier.deleted_at ? (
                    <DropdownMenuItem
                        className="cursor-pointer text-emerald-600 focus:text-emerald-700"
                        onSelect={() => restoreItem(supplier.id)}
                    >
                        <ArchiveRestore className="w-4 h-4 mr-2" /> Aktifkan
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onSelect={() => setConfirmingDeletion(supplier.id)}
                    >
                        <Archive className="w-4 h-4 mr-2" /> Nonaktifkan
                    </DropdownMenuItem>
                )}
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
                <SupplierFilterCard params={params} setFilter={setFilter} />

                <MobileCardList
                    data={suppliers.data}
                    renderItem={(supplier) => (
                        <div
                            onClick={() =>
                                router.get(route("suppliers.edit", supplier.id))
                            }
                            key={supplier.id}
                            className="cursor-pointer"
                        >
                            <SupplierMobileCard
                                supplier={supplier}
                                renderActionDropdown={renderActionDropdown}
                            />
                        </div>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={supplierColumns}
                        data={suppliers.data}
                        actions={renderActionDropdown}
                        showRoute={"suppliers.edit"}
                        rowClassName={(row) =>
                            row.deleted_at ? "opacity-50" : ""
                        }
                    />
                </div>

                {suppliers.data.length > 0 && (
                    <Pagination links={suppliers.meta.links} />
                )}
            </div>

            <DeleteConfirmationDialog
                open={confirmingDeletion !== null}
                onOpenChange={() => setConfirmingDeletion(null)}
                onConfirm={deactivateItem}
                isDeleting={isProcessing}
                confirmText="Nonaktifkan"
                title={`Nonaktifkan ${itemToDeactivate?.name}?`}
                description="Tindakan ini akan menyembunyikan supplier dari daftar, tetapi tidak menghapus data historisnya."
            />
        </IndexPageLayout>
    );
}
