import { router } from "@inertiajs/react";
import { useState } from "react";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { transactionColumns } from "@/Constants/tableColumns.jsx";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DeleteConfirmationDialog from "@/Components/DeleteConfirmationDialog";
import DataTable from "@/Components/DataTable";
import MobileCardList from "@/Components/MobileCardList";
import TransactionMobileCard from "./Partials/TransactionMobileCard";
import Pagination from "@/Components/Pagination";
import { Card, CardContent } from "@/Components/ui/card";
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
import { Eye, MoreVertical, Plus } from "lucide-react";

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
            </DropdownMenuContent>
        </DropdownMenu>
    );

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

                <MobileCardList
                    data={transactions.data}
                    renderItem={(transaction) => (
                        <TransactionMobileCard
                            key={transaction.id}
                            transaction={transaction}
                            renderActionDropdown={renderActionDropdown}
                        />
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={transactionColumns}
                        data={transactions.data}
                        actions={renderActionDropdown}
                        showRoute="transactions.purchases.show"
                    />
                </div>

                {transactions.data.length > 0 && (
                    <Pagination links={transactions.meta.links} />
                )}
            </div>
        </IndexPageLayout>
    );
}
