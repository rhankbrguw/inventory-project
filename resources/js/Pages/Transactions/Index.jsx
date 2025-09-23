import { Link, router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
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
import { Badge } from "@/Components/ui/badge";
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
import { Edit, Trash2, MoreVertical } from "lucide-react";
import Pagination from "@/Components/Pagination";

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
    return new Date(dateString).toLocaleString("id-ID", options);
};

export default function Index({
    auth,
    transactions = { data: [], meta: { links: [] } },
    filters = {},
    types = [],
}) {
    const [confirmingTransactionDeletion, setConfirmingTransactionDeletion] =
        useState(null);
    const [search, setSearch] = useState(filters.search || "");
    const [type, setType] = useState(filters.type || "all");
    const [debouncedSearch] = useDebounce(search, 500);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        router.get(
            route("transactions.index"),
            {
                search: debouncedSearch || undefined,
                type: type === "all" ? undefined : type,
            },
            { preserveState: true, replace: true }
        );
    }, [debouncedSearch, type]);

    const deleteTransaction = () => {
        router.delete(
            route("transactions.destroy", confirmingTransactionDeletion),
            {
                preserveScroll: true,
                onSuccess: () => setConfirmingTransactionDeletion(null),
            }
        );
    };

    const renderActionDropdown = (transaction) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <Link
                    href={route("transactions.purchases.show", transaction.id)}
                >
                    <DropdownMenuItem className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" /> Lihat
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    onClick={() =>
                        setConfirmingTransactionDeletion(transaction.id)
                    }
                    className="text-destructive focus:text-destructive cursor-pointer"
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
            createRoute="transactions.purchases.create"
            buttonLabel="Tambah Transaksi"
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-6">
                        <Input
                            type="search"
                            placeholder="Cari referensi atau supplier..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-auto sm:flex-grow"
                        />
                        <Select value={type} onValueChange={setType}>
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
                            <CardContent>
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

                <div className="hidden md:block bg-card text-card-foreground shadow-sm sm:rounded-lg">
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
                                    <TableRow key={trx.id}>
                                        {TABLE_COLUMNS.map((col) => (
                                            <TableCell
                                                key={col.key}
                                                className={getAlignmentClass(
                                                    col.align
                                                )}
                                            >
                                                {renderCellContent(col, trx)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>

                {transactions.data.length > 0 && (
                    <Pagination links={transactions.meta.links} />
                )}
            </div>

            <AlertDialog
                open={confirmingTransactionDeletion !== null}
                onOpenChange={() => setConfirmingTransactionDeletion(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Menghapus
                            transaksi dapat mempengaruhi data lain.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteTransaction}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Hapus Transaksi
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </IndexPageLayout>
    );
}
