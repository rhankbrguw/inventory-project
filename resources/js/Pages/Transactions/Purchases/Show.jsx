import ContentPageLayout from "@/Components/ContentPageLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Printer } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { ScrollArea, ScrollBar } from "@/Components/ui/scroll-area";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function Show({ auth, purchase }) {
    const { data } = purchase;

    return (
        <ContentPageLayout
            auth={auth}
            title="Detail Transaksi"
            backRoute="transactions.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Umum</CardTitle>
                    <CardDescription>{data.reference_code}</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Lokasi Penerima</p>
                        <p className="font-semibold">{data.location.name}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Supplier</p>
                        <p className="font-semibold">{data.supplier.name}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">
                            Tanggal Transaksi
                        </p>
                        <p className="font-semibold">
                            {formatDate(data.transaction_date)}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="outline" className="capitalize">
                            {data.status}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-muted-foreground">PIC</p>
                        <p className="font-semibold">{data.user.name}</p>
                    </div>
                    {data.notes && (
                        <div className="sm:col-span-3">
                            <p className="text-muted-foreground">Catatan</p>
                            <p className="font-semibold">{data.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle>Rincian Item</CardTitle>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Cetak</span>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="md:hidden space-y-3">
                        {data.items.map((item) => (
                            <Card key={item.id} className="p-3">
                                <div className="space-y-2">
                                    <div>
                                        <p className="font-medium text-sm">
                                            {item.product.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {item.product.sku}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span>
                                            {item.quantity} {item.product.unit}{" "}
                                            ×{" "}
                                            {formatCurrency(item.cost_per_unit)}
                                        </span>
                                        <span className="font-semibold">
                                            {formatCurrency(
                                                item.quantity *
                                                    item.cost_per_unit
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        <div className="flex justify-between items-center pt-3 border-t font-bold text-base">
                            <span>Total Pembelian</span>
                            <span>{formatCurrency(data.total_cost)}</span>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <ScrollArea className="w-full whitespace-nowrap">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-center">
                                            Produk
                                        </TableHead>
                                        <TableHead className="text-center">
                                            SKU
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Jumlah
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Harga Beli
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Subtotal
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center">
                                                <p className="font-medium">
                                                    {item.product.name}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <p className="text-xs font-mono">
                                                    {item.product.sku}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.quantity}{" "}
                                                {item.product.unit}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {formatCurrency(
                                                    item.cost_per_unit
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {formatCurrency(
                                                    item.quantity *
                                                        item.cost_per_unit
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell className="text-center font-bold">
                                            Total Pembelian
                                        </TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell className="text-center font-bold">
                                            {formatCurrency(data.total_cost)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}
