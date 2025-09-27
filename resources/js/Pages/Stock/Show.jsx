import ContentPageLayout from "@/Components/ContentPageLayout";
import Pagination from "@/Components/Pagination";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import {
    formatRelativeTime,
    formatDate,
    formatCurrency,
    formatNumber,
} from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/Components/ui/scroll-area";

export default function Show({ auth, inventory, stockMovements }) {
    return (
        <ContentPageLayout
            auth={auth}
            title="Informasi Stok"
            backRoute="stock.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{inventory.product.name}</CardTitle>
                    <CardDescription>
                        SKU: {inventory.product.sku}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Lokasi</p>
                        <p className="font-semibold">
                            {inventory.location.name}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">
                            Jumlah Stok Saat Ini
                        </p>
                        <p className="font-semibold text-lg">
                            {formatNumber(inventory.quantity)}{" "}
                            {inventory.product.unit}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">
                            Harga Pokok Penjualan (HPP)
                        </p>
                        <p className="font-semibold">
                            {formatCurrency(inventory.average_cost)}
                        </p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Pergerakan Stok</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="w-full whitespace-nowrap">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">
                                        Tanggal
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Tipe
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Referensi
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Perubahan
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Catatan
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockMovements.data.map((movement) => (
                                    <TableRow key={movement.id}>
                                        <TableCell className="text-center text-xs text-muted-foreground">
                                            {formatDate(movement.created_at)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant="outline"
                                                className="capitalize"
                                            >
                                                {movement.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-xs">
                                            {movement.reference || "-"}
                                        </TableCell>
                                        <TableCell
                                            className={`text-center font-semibold ${
                                                movement.quantity > 0
                                                    ? "text-success"
                                                    : "text-destructive"
                                            }`}
                                        >
                                            {movement.quantity > 0 ? "+" : ""}
                                            {movement.quantity}
                                        </TableCell>
                                        <TableCell className="text-center text-xs">
                                            {movement.notes || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <div className="mt-4">
                        <Pagination links={stockMovements.meta.links} />
                    </div>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}
