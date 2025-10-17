import { router } from "@inertiajs/react";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { transactionColumns } from "@/Constants/tableColumns.jsx";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DataTable from "@/Components/DataTable";
import MobileCardList from "@/Components/MobileCardList";
import TransactionMobileCard from "./Partials/TransactionMobileCard";
import Pagination from "@/Components/Pagination";
import TransactionFilterCard from "./Partials/TransactionFilterCard";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import { Eye, MoreVertical, Plus } from "lucide-react";

export default function Index({
    auth,
    transactions,
    locations,
    transactionTypes,
    filters = {},
}) {
    const { params, setFilter } = useIndexPageFilters(
        "transactions.index",
        filters
    );

    const canManageFullStock = ["Super Admin", "Warehouse Manager"].some(
        (role) => auth.user.roles.includes(role)
    );

    const renderActionDropdown = (transaction) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                >
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
                        {canManageFullStock && (
                            <DropdownMenuItem
                                onSelect={() =>
                                    router.get(
                                        route("transactions.transfers.create")
                                    )
                                }
                            >
                                Kirim Stok (Stock Transfer)
                            </DropdownMenuItem>
                        )}
                        {canManageFullStock && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onSelect={() =>
                                        router.get(
                                            route("stock-movements.index")
                                        )
                                    }
                                >
                                    Pergerakan Stok (Stock Movements)
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            }
        >
            <div className="space-y-4">
                <TransactionFilterCard
                    params={params}
                    setFilter={setFilter}
                    locations={locations}
                    transactionTypes={transactionTypes}
                />

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
