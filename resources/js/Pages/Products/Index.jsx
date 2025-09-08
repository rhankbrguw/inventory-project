import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import IndexPageLayout from "@/Components/IndexPageLayout";
import Pagination from "@/Components/Pagination";
import { Button } from "@/Components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Edit, Trash2, MoreVertical } from "lucide-react";

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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <Link
                                            href={route(
                                                "products.edit",
                                                product.id
                                            )}
                                        >
                                            <DropdownMenuItem className="cursor-pointer">
                                                <Edit className="w-4 h-4 mr-2" />{" "}
                                                Edit
                                            </DropdownMenuItem>
                                        </Link>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive cursor-pointer"
                                            onClick={() =>
                                                setConfirmingProductDeletion(
                                                    product.id
                                                )
                                            }
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />{" "}
                                            Hapus
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">
                                    SKU: {product.sku}
                                </div>
                                <div className="text-lg font-bold">
                                    {formatCurrency(product.price)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Stok: {product.stock_quantity}{" "}
                                    {product.unit}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="hidden md:block bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">
                                    Nama Produk
                                </TableHead>
                                <TableHead className="text-center">
                                    SKU
                                </TableHead>
                                <TableHead className="text-center">
                                    Harga
                                </TableHead>
                                <TableHead className="text-center">
                                    Satuan
                                </TableHead>
                                <TableHead className="text-center">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="text-center">
                                        {product.name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {product.sku}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {formatCurrency(product.price)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {product.unit}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link
                                                    href={route(
                                                        "products.edit",
                                                        product.id
                                                    )}
                                                >
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Edit className="w-4 h-4 mr-2" />{" "}
                                                        Edit
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive cursor-pointer"
                                                    onClick={() =>
                                                        setConfirmingProductDeletion(
                                                            product.id
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />{" "}
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
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
