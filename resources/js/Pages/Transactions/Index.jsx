import IndexPageLayout from "@/Components/IndexPageLayout";
import Pagination from "@/Components/Pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import { ScrollArea, ScrollBar } from "@/Components/ui/scroll-area";
import { Plus } from "lucide-react";
import { router } from "@inertiajs/react";

const TABLE_COLUMNS = [
    { key: "reference_code", label: "Referensi", align: "center" },
    { key: "type", label: "Tipe", align: "center" },
    { key: "location", label: "Lokasi", align: "center" },
    { key: "counterparty", label: "Pihak Terkait", align: "center" },
    { key: "transaction_date", label: "Tanggal", align: "center" },
    { key: "total", label: "Total", align: "center" },
    { key: "user", label: "PIC", align: "center" },
];

const getAlignmentClass = (align = "left") => {
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
    return new Date(dateString).toLocaleString("id-ID", options);
};

export default function Index({ auth, transactions }) {
    const renderCellContent = (column, transaction) => {
        switch (column.key) {
            case "reference_code":
                return (
                    <div className="font-mono text-xs whitespace-nowrap">
                        {transaction.reference_code}
                    </div>
                );
            case "type":
                return (
                    <div className="flex justify-center">
                        <Badge variant="secondary">{transaction.type}</Badge>
                    </div>
                );
            case "location":
                return (
                    <div className="whitespace-nowrap">
                        {transaction.location}
                    </div>
                );
            case "counterparty":
                return (
                    <div className="whitespace-nowrap">
                        {transaction.supplier || "-"}
                    </div>
                );
            case "transaction_date":
                return (
                    <div className="whitespace-nowrap text-center">
                        {formatDate(transaction.transaction_date)}
                    </div>
                );
            case "total":
                return (
                    <div className="font-semibold whitespace-nowrap text-right">
                        {formatCurrency(transaction.total_cost)}
                    </div>
                );
            case "user":
                return (
                    <div className="whitespace-nowrap">{transaction.user}</div>
                );
            default:
                return "";
        }
    };

    return (
        <IndexPageLayout
            auth={auth}
            title="Riwayat Transaksi"
            headerActions={
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="flex items-center gap-2 shrink-0">
                            <Plus className="w-4 h-4" /> Tambah Transaksi
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onSelect={() =>
                                router.get(
                                    route("transactions.purchases.create")
                                )
                            }
                        >
                            Pembelian (Purchase)
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                            Transfer Stok (Coming Soon)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            }
        >
            <div className="space-y-4">
                <div className="md:hidden space-y-4">
                    {transactions.data.map((trx) => (
                        <Card
                            key={trx.id}
                            onClick={() =>
                                router.get(
                                    route("transactions.purchases.show", trx.id)
                                )
                            }
                            className="cursor-pointer hover:bg-muted/50"
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-sm font-mono">
                                            {trx.reference_code}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(trx.transaction_date)}
                                        </p>
                                    </div>
                                    <Badge variant="secondary">
                                        {trx.type}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-lg font-bold">
                                    {formatCurrency(trx.total_cost)}
                                </div>
                                <div className="text-xs space-y-1">
                                    <p>
                                        Lokasi:{" "}
                                        <span className="font-medium">
                                            {trx.location}
                                        </span>
                                    </p>
                                    <p>
                                        Supplier:{" "}
                                        <span className="font-medium">
                                            {trx.supplier}
                                        </span>
                                    </p>
                                    <p>
                                        PIC:{" "}
                                        <span className="font-medium">
                                            {trx.user}
                                        </span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="hidden md:block">
                    <div className="bg-card text-card-foreground shadow-sm sm:rounded-lg">
                        <ScrollArea className="w-full">
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
                                    {transactions.data.map((trx) => (
                                        <TableRow
                                            key={trx.id}
                                            onClick={() =>
                                                router.get(
                                                    route(
                                                        "transactions.purchases.show",
                                                        trx.id
                                                    )
                                                )
                                            }
                                            className="cursor-pointer"
                                        >
                                            {TABLE_COLUMNS.map((col) => (
                                                <TableCell
                                                    key={col.key}
                                                    className={getAlignmentClass(
                                                        col.align
                                                    )}
                                                >
                                                    {renderCellContent(
                                                        col,
                                                        trx
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </div>
                </div>

                {transactions.data.length > 0 && (
                    <Pagination links={transactions.meta.links} />
                )}
            </div>
        </IndexPageLayout>
    );
}
