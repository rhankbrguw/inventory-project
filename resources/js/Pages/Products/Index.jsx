import { Link, router } from "@inertiajs/react";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { useSoftDeletes } from "@/Hooks/useSoftDeletes";
import { productColumns } from "@/Constants/tableColumns.jsx";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DeleteConfirmationDialog from "@/Components/DeleteConfirmationDialog";
import DataTable from "@/Components/DataTable";
import MobileCardList from "@/Components/MobileCardList";
import ProductMobileCard from "./Partials/ProductMobileCard";
import Pagination from "@/Components/Pagination";
import QuickAddTypeModal from "@/Components/QuickAddTypeModal";
import ProductFilterCard from "./Partials/ProductFilterCard";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import {
    Edit,
    MoreVertical,
    PlusCircle,
    Archive,
    ArchiveRestore,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Index({
    auth,
    products,
    allProducts,
    productTypes,
    filters = {},
}) {
    const { params, setFilter } = useIndexPageFilters(
        "products.index",
        filters
    );
    const {
        confirmingDeletion,
        setConfirmingDeletion,
        isProcessing,
        itemToDeactivate,
        deactivateItem,
        restoreItem,
    } = useSoftDeletes({ resourceName: "products", data: products.data });

    const canCrudProducts = ["Super Admin", "Branch Manager"].some((role) =>
        auth.user.roles.includes(role)
    );

    const renderActionDropdown = (product) => (
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
                        router.get(route("products.edit", product.id))
                    }
                >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                {product.deleted_at ? (
                    <DropdownMenuItem
                        className="cursor-pointer text-success focus:text-success"
                        onSelect={() => restoreItem(product.id)}
                    >
                        <ArchiveRestore className="w-4 h-4 mr-2" /> Aktifkan
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onSelect={() => setConfirmingDeletion(product.id)}
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
            title="Manajemen Produk"
            createRoute={canCrudProducts ? "products.create" : null}
            buttonLabel="Tambah Produk"
            headerActions={
                canCrudProducts && (
                    <QuickAddTypeModal
                        group="product_type"
                        title="Tambah Tipe Produk Cepat"
                        description="Tipe yang baru dibuat akan langsung tersedia di dropdown pada form."
                        existingTypes={productTypes.data}
                        trigger={
                            <Button
                                variant="outline"
                                className="hidden sm:flex items-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4" /> Tambah Tipe
                            </Button>
                        }
                    />
                )
            }
        >
            <div className="space-y-4">
                <ProductFilterCard
                    params={params}
                    setFilter={setFilter}
                    allProducts={allProducts}
                />

                <MobileCardList
                    data={products.data}
                    renderItem={(product) => (
                        <Link
                            href={route("products.edit", product.id)}
                            key={product.id}
                            className={cn(
                                "block",
                                product.deleted_at ? "opacity-50" : ""
                            )}
                        >
                            <ProductMobileCard
                                product={product}
                                renderActionDropdown={
                                    canCrudProducts
                                        ? renderActionDropdown
                                        : null
                                }
                            />
                        </Link>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={productColumns}
                        data={products.data}
                        actions={canCrudProducts ? renderActionDropdown : null}
                        showRoute={canCrudProducts ? "products.edit" : null}
                        rowClassName={(row) =>
                            row.deleted_at ? "opacity-50" : ""
                        }
                    />
                </div>

                {products.data.length > 0 && (
                    <Pagination links={products.meta.links} />
                )}
            </div>

            {canCrudProducts && (
                <DeleteConfirmationDialog
                    open={confirmingDeletion !== null}
                    onOpenChange={() => setConfirmingDeletion(null)}
                    onConfirm={deactivateItem}
                    isDeleting={isProcessing}
                    confirmText="Nonaktifkan"
                    title={`Nonaktifkan ${itemToDeactivate?.name}?`}
                    description="Tindakan ini akan menyembunyikan produk dari daftar. Anda bisa mengaktifkannya kembali nanti."
                />
            )}
        </IndexPageLayout>
    );
}
