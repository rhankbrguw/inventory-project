import { Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
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
import { toast } from "sonner";

const TABLE_COLUMNS = [
    { key: "image", label: "Gambar", align: "center" },
    {
        key: "name",
        label: "Nama Produk",
        align: "left",
        className: "font-medium",
    },
    { key: "sku", label: "SKU", align: "center", className: "font-mono" },
    { key: "type", label: "Tipe", align: "center" },
    { key: "supplier", label: "Supplier Andalan", align: "center" },
    {
        key: "price",
        label: "Harga",
        align: "center",
        className: "font-semibold",
    },
    { key: "actions", label: "Aksi", align: "center" },
];

const getAlignmentClass = (align) => ({
    "text-center": align === "center",
    "text-left": align === "left",
    "text-right": align === "right",
});

const QuickAddTypeModal = ({ productTypes = [] }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        code: "",
        group: "product_type",
    });
    const [open, setOpen] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("types.store"), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                reset();
                router.reload();
                toast.success("Tipe produk baru telah berhasil ditambahkan.");
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Tambah Tipe
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="pb-3">
                    <DialogTitle className="text-lg">
                        Tambah Tipe Produk
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Form untuk menambahkan tipe produk baru
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="typeName" className="text-sm">
                                Nama Tipe
                            </Label>
                            <Input
                                id="typeName"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className="mt-1 h-9"
                                placeholder="Contoh: Electronics"
                            />
                            <InputError
                                message={errors.name}
                                className="mt-1 text-xs"
                            />
                        </div>
                        <div>
                            <Label htmlFor="typeCode" className="text-sm">
                                Kode
                            </Label>
                            <Input
                                id="typeCode"
                                value={data.code}
                                onChange={(e) =>
                                    setData("code", e.target.value)
                                }
                                className="mt-1 h-9"
                                placeholder="ELC"
                            />
                            <InputError
                                message={errors.code}
                                className="mt-1 text-xs"
                            />
                        </div>
                    </div>

                    {productTypes.length > 0 && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs font-medium mb-2 text-muted-foreground">
                                Tipe Tersedia:
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {productTypes.slice(0, 5).map((type) => (
                                    <Badge
                                        key={type.id}
                                        variant="secondary"
                                        className="text-xs px-2 py-0.5"
                                    >
                                        {type.name}
                                    </Badge>
                                ))}
                                {productTypes.length > 5 && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <span className="inline-flex items-center rounded-md border border-input bg-background px-2 py-0.5 text-xs font-semibold text-foreground hover:bg-accent cursor-pointer">
                                                +{productTypes.length - 5}{" "}
                                                lainnya
                                            </span>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="start"
                                            className="max-h-48 overflow-y-auto"
                                        >
                                            {productTypes
                                                .slice(5)
                                                .map((type) => (
                                                    <DropdownMenuItem
                                                        key={type.id}
                                                        className="text-xs"
                                                    >
                                                        {type.name}{" "}
                                                        {type.code &&
                                                            `(${type.code})`}
                                                    </DropdownMenuItem>
                                                ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" size="sm">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button disabled={processing} size="sm">
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default function Index({
    auth,
    products,
    suppliers,
    productTypes,
    filters = {},
}) {
    const [confirmingProductDeletion, setConfirmingProductDeletion] =
        useState(null);
    const [supplierFilter, setSupplierFilter] = useState(
        filters.supplier_id || "all"
    );

    const handleFilterChange = (value) => {
        setSupplierFilter(value);
        router.get(
            route("products.index"),
            { supplier_id: value === "all" ? undefined : value },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);

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
            case "supplier":
                return product.default_supplier
                    ? product.default_supplier.name
                    : "-";
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
        >
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Aksi</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                        <div className="flex-grow">
                            <Select
                                value={supplierFilter}
                                onValueChange={handleFilterChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter berdasarkan supplier..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tampilkan Semua Supplier
                                    </SelectItem>
                                    {suppliers.map((supplier) => (
                                        <SelectItem
                                            key={supplier.id}
                                            value={supplier.id.toString()}
                                        >
                                            {supplier.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <QuickAddTypeModal productTypes={productTypes} />
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
                                    Supplier:{" "}
                                    {product.default_supplier
                                        ? product.default_supplier.name
                                        : "-"}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="hidden md:block bg-white shadow-sm sm:rounded-lg overflow-x-auto">
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
                                            className={getAlignmentClass(
                                                col.align
                                            )}
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

            <AlertDialog
                open={confirmingProductDeletion !== null}
                onOpenChange={() => setConfirmingProductDeletion(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Produk ini akan
                            dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteProduct}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Hapus Produk
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </IndexPageLayout>
    );
}
