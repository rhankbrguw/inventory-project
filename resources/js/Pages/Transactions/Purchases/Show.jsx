import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ArrowLeft } from "lucide-react";
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

const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);

const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
};

export default function Show({ auth, purchase }) {
    const { data } = purchase;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Detail Pembelian ${data.reference_code}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route("transactions.index")}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-grow">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Detail Transaksi
                        </h1>
                        <p className="text-muted-foreground font-mono text-sm">
                            {data.reference_code}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Umum</CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">
                                Lokasi Penerima
                            </p>
                            <p className="font-semibold">
                                {data.location.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Supplier</p>
                            <p className="font-semibold">
                                {data.supplier.name}
                            </p>
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
                            <p>
                                <Badge variant="outline">{data.status}</Badge>
                            </p>
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
                    <CardHeader>
                        <CardTitle>Rincian Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead className="text-right">
                                        Jumlah
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Harga Beli
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Subtotal
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <p className="font-medium">
                                                {item.product.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono">
                                                {item.product.sku}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.quantity} {item.product.unit}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(item.cost_per_unit)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
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
                                    <TableCell
                                        colSpan={3}
                                        className="text-right font-bold text-base"
                                    >
                                        Total Keseluruhan
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-base">
                                        {formatCurrency(data.total_cost)}
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
