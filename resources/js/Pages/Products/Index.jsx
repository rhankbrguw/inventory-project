import { Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DeleteConfirmationDialog from "@/Components/DeleteConfirmationDialog";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from "@/Components/ui/dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import InputError from "@/Components/InputError";
import {
    Edit,
    Trash2,
    MoreVertical,
    Package,
    PlusCircle,
    Info,
} from "lucide-react";
import Pagination from "@/Components/Pagination";

const TABLE_COLUMNS = [
    { key: "image", label: "Gambar", align: "center" },
    {
        key: "name",
        label: "Nama Produk",
        align: "center",
        className: "font-medium",
    },
    { key: "sku", label: "SKU", align: "center", className: "font-mono" },
    { key: "type", label: "Tipe", align: "center" },
    { key: "created_at", label: "Tgl. Dibuat", align: "center" },
    {
        key: "price",
        label: "Harga",
        align: "center",
        className: "font-semibold",
    },
    { key: "actions", label: "Aksi", align: "center" },
];

const getAlignmentClass = (align) => {
    const alignmentMap = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    };
    return alignmentMap[align] || "text-left";
};

const QuickAddTypeModal = ({ productTypes = [], trigger }) => {
    const { data, setData, post, processing, errors, isDirty, reset } = useForm(
        {
            name: "",
            code: "",
            group: "product_type",
        }
    );
    const [open, setOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("types.store"), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[420px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-lg">
                        Tambah Tipe Produk
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Tipe baru akan langsung tersedia di form.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-3">
                    <div className="space-y-1">
                        <Label
                            htmlFor="typeName"
                            className="text-sm font-medium"
                        >
                            Nama Tipe
                        </Label>
                        <Input
                            id="typeName"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Contoh: Makanan, Minuman"
                            className="h-9"
                            autoFocus
                        />
                        <InputError message={errors.name} className="text-xs" />
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="typeCode"
                            className="text-sm font-medium"
                        >
                            Kode{" "}
                            <span className="text-xs text-muted-foreground">
                                (opsional)
                            </span>
                        </Label>
                        <Input
                            id="typeCode"
                            value={data.code}
                            onChange={(e) => setData("code", e.target.value)}
                            placeholder="Contoh: MKN, MNM"
                            className="h-9"
                        />
                        <InputError message={errors.code} className="text-xs" />
                    </div>

                    {productTypes.length > 0 && (
                        <div className="bg-muted/50 p-3 rounded-md space-y-2">
                            <div className="flex items-center gap-2">
                                <Info className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">
                                    Tipe yang sudah ada ({productTypes.length})
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                                {productTypes.slice(0, 8).map((type) => (
                                    <Badge
                                        key={type.id}
                                        variant="secondary"
                                        className="text-xs px-2 py-0.5 h-6"
                                    >
                                        {type.name}
                                    </Badge>
                                ))}
                                {productTypes.length > 8 && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-0.5 h-6"
                                    >
                                        +{productTypes.length - 8} lainnya
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9"
                            >
                                Batal
                            </Button>
                        </DialogClose>
                        <Button
                            disabled={processing || !isDirty}
                            size="sm"
                            className="h-9"
                        >
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const sortOptions = [
    { value: "newest", label: "Produk Terbaru" },
    { value: "oldest", label: "Produk Terlama" },
    { value: "price_desc", label: "Harga Tertinggi" },
    { value: "price_asc", label: "Harga Terendah" },
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
    const [confirmingProductDeletion, setConfirmingProductDeletion] =
        useState(null);

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

    const renderCellContent = (column, product) => {
        switch (column.key) {
            case "image":
                return (
                    <div className="flex justify-center">
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-12 w-12 rounded-md object-cover"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                );
            case "name":
                return product.name;
            case "sku":
                return product.sku;
            case "type":
                return product.type ? product.type.name : "-";
            case "created_at":
                return (
                    <div className="text-xs text-muted-foreground">
                        {formatDate(product.created_at)}
                    </div>
                );
            case "price":
                return formatCurrency(product.price);
            case "actions":
                return renderActionDropdown(product);
            default:
                return "";
        }
    };

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Produk"
            createRoute="products.create"
            buttonLabel="Tambah Produk"
            headerActions={
                <QuickAddTypeModal
                    productTypes={productTypes}
                    trigger={
                        <Button
                            variant="outline"
                            className="hidden sm:flex items-center gap-2"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Tambah Tipe
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
                            onChange={(e) =>
                                setFilter("search", e.target.value)
                            }
                            className="w-full sm:w-auto sm:flex-grow"
                        />
                        <Select
                            value={params.supplier_id || "all"}
                            onValueChange={(value) =>
                                setFilter("supplier_id", value)
                            }
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Semua Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Supplier
                                </SelectItem>
                                {suppliers.map((s) => (
                                    <SelectItem
                                        key={s.id}
                                        value={s.id.toString()}
                                    >
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
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="sm:hidden">
                            <QuickAddTypeModal
                                productTypes={productTypes}
                                trigger={
                                    <Button
                                        variant="outline"
                                        className="w-full flex items-center gap-2"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Tambah Tipe
                                    </Button>
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="md:hidden space-y-4">
                    {products.data.map((product) => (
                        <Card key={product.id}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="h-14 w-14 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="h-14 w-14 rounded-md bg-secondary flex items-center justify-center">
                                            <Package className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <CardTitle className="text-sm font-medium">
                                            {product.name}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            SKU: {product.sku}
                                        </p>
                                        <p className="text-xs font-semibold">
                                            {product.type
                                                ? product.type.name
                                                : "No Type"}
                                        </p>
                                    </div>
                                </div>
                                {renderActionDropdown(product)}
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold">
                                    {formatCurrency(product.price)} /{" "}
                                    {product.unit}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Ditambahkan:{" "}
                                    {formatDate(product.created_at)}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="hidden md:block bg-card text-card-foreground shadow-sm sm:rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {TABLE_COLUMNS.map((col) => (
                                    <TableHead
                                        key={col.key}
                                        className={getAlignmentClass(col.align)}
                                    >
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.map((product) => (
                                <TableRow key={product.id}>
                                    {TABLE_COLUMNS.map((col) => (
                                        <TableCell
                                            key={col.key}
                                            className={`${getAlignmentClass(
                                                col.align
                                            )} ${col.className || ""}`}
                                        >
                                            {renderCellContent(col, product)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {products.data.length > 0 && (
                    <Pagination links={products.meta.links} />
                )}
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
