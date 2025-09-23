import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
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

const TABLE_COLUMNS = [
    { key: "product", label: "Produk", align: "center" },
    { key: "quantity", label: "Jumlah", align: "center" },
    { key: "price", label: "Harga Beli", align: "center" },
    { key: "subtotal", label: "Subtotal", align: "center" },
];

const getAlignmentClass = (align) => {
    const alignmentMap = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    };
    return alignmentMap[align] || "text-left";
};

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

    const renderCellContent = (column, item) => {
        switch (column.key) {
            case "product":
                return (
                    <div className="text-center">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                            {item.product.sku}
                        </p>
                    </div>
                );
            case "quantity":
                return (
                    <div className="text-center">
                        {item.quantity} {item.product.unit}
                    </div>
                );
            case "price":
                return (
                    <div className="text-center">
                        {formatCurrency(item.cost_per_unit)}
                    </div>
                );
            case "subtotal":
                return (
                    <div className="text-center font-semibold">
                        {formatCurrency(item.quantity * item.cost_per_unit)}
                    </div>
                );
            default:
                return "";
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Detail Pembelian ${data.reference_code}`} />

            <div className="space-y-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href={route("transactions.index")}>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                                    Detail Transaksi
                                </h1>
                                <p className="text-muted-foreground font-mono text-xs sm:text-sm">
                                    {data.reference_code}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                        >
                            <Printer className="w-3 h-3" />
                        </Button>
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
                                <Badge variant="outline" className="capitalize">
                                    {data.status}
                                </Badge>
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
                                                {item.quantity}{" "}
                                                {item.product.unit} ×{" "}
                                                {formatCurrency(
                                                    item.cost_per_unit
                                                )}
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
                            <div className="flex justify-between items-center pt-3 border-t font-bold">
                                <span>Total Keseluruhan</span>
                                <span>{formatCurrency(data.total_cost)}</span>
                            </div>
                        </div>

                        <div className="hidden md:block">
                            <div className="bg-card text-card-foreground shadow-sm sm:rounded-lg overflow-x-auto">
                                <Table className="min-w-full">
                                    <TableHeader>
                                        <TableRow>
                                            {TABLE_COLUMNS.map((col) => (
                                                <TableHead
                                                    key={col.key}
                                                    className={getAlignmentClass(
                                                        col.align
                                                    )}
                                                >
                                                    {col.label}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.items.map((item) => (
                                            <TableRow key={item.id}>
                                                {TABLE_COLUMNS.map((col) => (
                                                    <TableCell
                                                        key={col.key}
                                                        className={getAlignmentClass(
                                                            col.align
                                                        )}
                                                    >
                                                        {renderCellContent(
                                                            col,
                                                            item
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell className="text-center font-bold text-base">
                                                Total Keseluruhan
                                            </TableCell>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                            <TableCell className="text-center font-bold text-base">
                                                {formatCurrency(
                                                    data.total_cost
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
