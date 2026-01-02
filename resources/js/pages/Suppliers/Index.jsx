import { Link, router } from "@inertiajs/react";
import IndexPageLayout from "@/components/IndexPageLayout";
import DataTable from "@/components/DataTable";
import MobileCardList from "@/components/MobileCardList";
import SupplierMobileCard from "./Partials/SupplierMobileCard";
import { supplierColumns } from "@/constants/tableColumns";
import { useIndexPageFilters } from "@/hooks/useIndexPageFilters";
import { useSoftDeletes } from "@/hooks/useSoftDeletes";
import Pagination from "@/components/Pagination";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import SupplierFilterCard from "./Partials/SupplierFilterCard";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Archive, ArchiveRestore } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/usePermission";

export default function Index({ auth, suppliers, filters }) {
    const { params, setFilter } = useIndexPageFilters(
        "suppliers.index",
        filters,
    );

    const { isManager } = usePermission();
    const canCrudSuppliers = isManager;

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
                        className="cursor-pointer text-success focus:text-success"
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
            createRoute={canCrudSuppliers ? "suppliers.create" : null}
            buttonLabel="Tambah Supplier"
        >
            <div className="space-y-4">
                <SupplierFilterCard params={params} setFilter={setFilter} />
                <MobileCardList
                    data={suppliers.data}
                    renderItem={(supplier) => (
                        <Link
                            href={
                                canCrudSuppliers
                                    ? route("suppliers.edit", supplier.id)
                                    : "#"
                            }
                            key={supplier.id}
                            className={cn(
                                !canCrudSuppliers && "pointer-events-none",
                                supplier.deleted_at && "opacity-50",
                            )}
                        >
                            <SupplierMobileCard
                                supplier={supplier}
                                renderActionDropdown={
                                    canCrudSuppliers
                                        ? renderActionDropdown
                                        : null
                                }
                            />
                        </Link>
                    )}
                />
                <div className="hidden md:block">
                    <DataTable
                        columns={supplierColumns}
                        data={suppliers.data}
                        actions={canCrudSuppliers ? renderActionDropdown : null}
                        showRoute={canCrudSuppliers ? "suppliers.edit" : null}
                        rowClassName={(row) =>
                            row.deleted_at ? "opacity-50" : ""
                        }
                    />
                </div>
                {suppliers.data.length > 0 && (
                    <Pagination links={suppliers.meta.links} />
                )}
            </div>
            {canCrudSuppliers && (
                <DeleteConfirmationDialog
                    open={confirmingDeletion !== null}
                    onOpenChange={() => setConfirmingDeletion(null)}
                    onConfirm={deactivateItem}
                    isDeleting={isProcessing}
                    confirmText="Nonaktifkan"
                    title={`Nonaktifkan ${itemToDeactivate?.name}?`}
                    description="Tindakan ini akan menyembunyikan supplier dari daftar. Anda bisa mengaktifkannya kembali nanti."
                />
            )}
        </IndexPageLayout>
    );
}
