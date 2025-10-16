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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Card, CardContent } from "@/Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Edit,
    MoreVertical,
    PlusCircle,
    Archive,
    ArchiveRestore,
} from "lucide-react";

const sortOptions = [
    { value: "newest", label: "Produk Terbaru" },
    { value: "oldest", label: "Produk Terlama" },
    { value: "price_desc", label: "Harga Tertinggi" },
    { value: "price_asc", label: "Harga Terendah" },
];

const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Nonaktif" },
];

export default function Index({
    auth,
    products,
    suppliers,
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
                        className="cursor-pointer text-emerald-600 focus:text-emerald-700"
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
                <Card>
                    <CardContent className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-6">
                        <Input
                            type="search"
                            placeholder="Cari nama atau sku..."
                            value={params.search || ""}
                            onChange={(e) =>
                                setFilter("search", e.target.value)
                            }
                            className="w-full sm:w-auto sm:flex-grow"
                        />
                        <Select
                            value={params.status || "all"}
                            onValueChange={(value) =>
                                setFilter("status", value)
                            }
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={params.sort || "newest"}
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
                        {canCrudProducts && (
                            <div className="sm:hidden">
                                <QuickAddTypeModal
                                    group="product_type"
                                    title="Tambah Tipe Produk Cepat"
                                    description="Tipe yang baru dibuat akan langsung tersedia di dropdown pada form."
                                    existingTypes={productTypes.data}
                                    trigger={
                                        <Button
                                            variant="outline"
                                            className="w-full flex items-center gap-2"
                                        >
                                            <PlusCircle className="w-4 h-4" />{" "}
                                            Tambah Tipe
                                        </Button>
                                    }
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <MobileCardList
                    data={products.data}
                    renderItem={(product) => (
                        <ProductMobileCard
                            key={product.id}
                            product={product}
                            renderActionDropdown={
                                canCrudProducts ? renderActionDropdown : null
                            }
                        />
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
