import IndexPageLayout from "@/Components/IndexPageLayout";
import Pagination from "@/Components/Pagination";
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
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
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
import { Link, router } from "@inertiajs/react";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";

const TABLE_COLUMNS = [
    {
        key: "name",
        label: "Nama Produk",
        align: "center",
        className: "font-medium",
    },
    {
        key: "sku",
        label: "SKU",
        align: "center",
        className: "font-mono",
    },
    {
        key: "price",
        label: "Harga",
        align: "center",
        className: "font-semibold",
    },
    {
        key: "unit",
        label: "Satuan",
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

export default function Index({ auth, products }) {
    const [confirmingProductDeletion, setConfirmingProductDeletion] =
        useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

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
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => setConfirmingProductDeletion(product.id)}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const renderCellContent = (column, product) => {
        switch (column.key) {
            case "name":
                return product.name;
            case "sku":
                return product.sku;
            case "price":
                return formatCurrency(product.price);
            case "unit":
                return product.unit;
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
                <div className="md:hidden space-y-4">
                    {products.data.map((product) => (
                        <Card key={product.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {product.name}
                                </CardTitle>
                                {renderActionDropdown(product)}
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">
                                    SKU: {product.sku}
                                </div>
                                <div className="text-lg font-bold">
                                    {formatCurrency(product.price)}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="hidden md:block bg-white shadow-sm sm:rounded-lg overflow-x-auto">
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
                            {products.data.map((product) => (
                                <TableRow key={product.id}>
                                    {TABLE_COLUMNS.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            className={`${getAlignmentClass(
                                                column.align
                                            )} ${column.className || ""}`}
                                        >
                                            {renderCellContent(column, product)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Pagination links={products.meta.links} />
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
