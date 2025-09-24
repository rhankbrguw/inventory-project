import { router } from "@inertiajs/react";
import { useState } from "react";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DeleteConfirmationDialog from "@/Components/DeleteConfirmationDialog";
import Pagination from "@/Components/Pagination";
import { formatCurrency, formatDate } from "@/lib/utils";
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
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { ScrollArea, ScrollBar } from "@/Components/ui/scroll-area";
import { Eye, MoreVertical, Trash2, Plus } from "lucide-react";

const TABLE_COLUMNS = [
    { key: "reference_code", label: "Referensi", align: "center" },
    { key: "type", label: "Tipe", align: "center" },
    { key: "location", label: "Lokasi", align: "center" },
    { key: "counterparty", label: "Pihak Terkait", align: "center" },
    { key: "transaction_date", label: "Tanggal", align: "center" },
    { key: "total", label: "Total", align: "center" },
    { key: "user", label: "PIC", align: "center" },
    { key: "actions", label: "Aksi", align: "center" },
];

const getAlignmentClass = (align = "left") => {
    const alignmentMap = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    };
    return alignmentMap[align] || "text-left";
};

const sortOptions = [
    { value: "newest", label: "Transaksi Terbaru" },
    { value: "oldest", label: "Transaksi Terlama" },
    { value: "total_desc", label: "Total Terbesar" },
    { value: "total_asc", label: "Total Terkecil" },
];

export default function Index({
    auth,
    transactions,
    filters = {},
    types = [],
}) {
    const { params, setFilter } = useIndexPageFilters(
        "transactions.index",
        filters
    );
    const [confirmingTransactionDeletion, setConfirmingTransactionDeletion] =
        useState(null);

    const deleteTransaction = () => {
        console.log("Deleting transaction:", confirmingTransactionDeletion);
        setConfirmingTransactionDeletion(null);
    };

    const renderActionDropdown = (transaction) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() =>
                        router.get(
                            route("transactions.purchases.show", transaction.id)
                        )
                    }
                >
                    <Eye className="w-4 h-4 mr-2" /> Lihat
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        setConfirmingTransactionDeletion(transaction.id)
                    }
                    className="text-destructive focus:text-destructive cursor-pointer"
                    disabled
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

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
            case "actions":
                return renderActionDropdown(transaction);
            default:
                return "";
        }
    };

    return (
        <IndexPageLayout
            auth={auth}
            title="Riwayat Transaksi"
            buttonLabel="Tambah Transaksi"
            headerActions={
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div>
                            <Button
                                size="icon"
                                className="sm:hidden rounded-full h-10 w-10"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                            <Button className="hidden sm:flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                <span>Tambah Transaksi</span>
                            </Button>
                        </div>
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
                <Card>
                    <CardContent className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-6">
                        <Input
                            type="search"
                            placeholder="Cari referensi atau supplier..."
                            value={params.search || ""}
                            onChange={(e) =>
                                setFilter("search", e.target.value)
                            }
                            className="w-full sm:w-auto sm:flex-grow"
                        />
                        <Select
                            value={params.type || "all"}
                            onValueChange={(value) => setFilter("type", value)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Semua Tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                {types.map((typeName) => (
                                    <SelectItem key={typeName} value={typeName}>
                                        {typeName}
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
                    </CardContent>
                </Card>

                <div className="md:hidden space-y-4">
                    {transactions.data.map((trx) => (
                        <Card key={trx.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-mono">
                                        {trx.reference_code}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(trx.transaction_date)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                        {trx.type}
                                    </Badge>
                                    {renderActionDropdown(trx)}
                                </div>
                            </CardHeader>
                            <CardContent
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
                                <div className="text-lg font-bold mb-2">
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

            <DeleteConfirmationDialog
                open={confirmingTransactionDeletion !== null}
                onOpenChange={() => setConfirmingTransactionDeletion(null)}
                onConfirm={deleteTransaction}
                confirmText="Hapus Transaksi"
                description="Tindakan ini tidak dapat dibatalkan. Menghapus transaksi dapat mempengaruhi data lain."
            />
        </IndexPageLayout>
    );
}
