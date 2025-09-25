import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
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
import { Edit, Trash2, MoreVertical, PlusCircle } from "lucide-react";

const sortOptions = [
    { value: "newest", label: "Produk Terbaru" },
    { value: "oldest", label: "Produk Terlama" },
    { value: "price_desc", label: "Harga Tertinggi" },
    { value: "price_asc", label: "Harga Terendah" },
];

export default function Index({ auth, products, suppliers, productTypes, filters = {} }) {
    const { params, setFilter } = useIndexPageFilters("products.index", filters);
    const [confirmingProductDeletion, setConfirmingProductDeletion] = useState(null);

    const deleteProduct = () => {
        router.delete(route("products.destroy", confirmingProductDeletion), {
            preserveScroll: true,
            onSuccess: () => setConfirmingProductDeletion(null),
        });
    };

    const renderActionDropdown = (product) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <Link href={route("products.edit", product.id)}>
                    <DropdownMenuItem className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    onClick={() => setConfirmingProductDeletion(product.id)}
                    className="text-destructive focus:text-destructive cursor-pointer"
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Produk"
            createRoute="products.create"
            buttonLabel="Tambah Produk"
            headerActions={
                <QuickAddTypeModal
                    group="product_type"
                    title="Tambah Tipe Produk Cepat"
                    description="Tipe yang baru dibuat akan langsung tersedia di dropdown pada form."
                    existingTypes={productTypes}
                    trigger={
                        <Button variant="outline" className="hidden sm:flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" /> Tambah Tipe
                        </Button>
                    }
                />
            }
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-6">
                        <Input
                            type="search"
                            placeholder="Cari nama atau sku..."
                            value={params.search || ""}
                            onChange={(e) => setFilter("search", e.target.value)}
                            className="w-full sm:w-auto sm:flex-grow"
                        />
                        <Select
                            value={params.supplier_id || "all"}
                            onValueChange={(value) => setFilter("supplier_id", value)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Semua Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Supplier</SelectItem>
                                {suppliers.map((s) => (
                                    <SelectItem key={s.id} value={s.id.toString()}>
                                        {s.name}
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
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="sm:hidden">
                            <QuickAddTypeModal
                                group="product_type"
                                title="Tambah Tipe Produk Cepat"
                                description="Tipe yang baru dibuat akan langsung tersedia di dropdown pada form."
                                existingTypes={productTypes}
                                trigger={
                                    <Button variant="outline" className="w-full flex items-center gap-2">
                                        <PlusCircle className="w-4 h-4" /> Tambah Tipe
                                    </Button>
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <MobileCardList
                    data={products.data}
                    renderItem={(product) => <ProductMobileCard key={product.id} product={product} renderActionDropdown={renderActionDropdown} />}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={productColumns}
                        data={products.data}
                        actions={renderActionDropdown}
                        showRoute={"products.edit"}
                    />
                </div>

                {products.data.length > 0 && <Pagination links={products.meta.links} />}
            </div>

            <DeleteConfirmationDialog
                open={confirmingProductDeletion !== null}
                onOpenChange={() => setConfirmingProductDeletion(null)}
                onConfirm={deleteProduct}
                description="Tindakan ini tidak dapat dibatalkan. Produk ini akan dihapus secara permanen."
                confirmText="Hapus Produk"
            />
        </IndexPageLayout>
    );
}
