import { Link, router, usePage } from "@inertiajs/react";
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
    const { auth: authData } = usePage().props;
    const hasRole = (roleName) => authData.user.roles.includes(roleName);

    const { params, setFilter } = useIndexPageFilters(
        "transactions.index",
        filters
    );

    const canCreatePurchase =
        hasRole("Super Admin") ||
        hasRole("Warehouse Manager") ||
        hasRole("Branch Manager");
    const canCreateSell =
        hasRole("Super Admin") ||
        hasRole("Branch Manager") ||
        hasRole("Cashier");

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
                    onSelect={() => router.get(transaction.url)}
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
                (canCreatePurchase || canCreateSell) && (
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
                            {canCreatePurchase && (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={() =>
                                        router.get(
                                            route(
                                                "transactions.purchases.create"
                                            )
                                        )
                                    }
                                >
                                    Pembelian (Purchases)
                                </DropdownMenuItem>
                            )}
                            {canCreateSell && (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={() =>
                                        router.get(
                                            route("transactions.sells.create")
                                        )
                                    }
                                >
                                    Penjualan (Sells)
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
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
                        <Link
                            href={transaction.url}
                            key={transaction.unique_key}
                        >
                            <TransactionMobileCard
                                transaction={transaction}
                                renderActionDropdown={renderActionDropdown}
                            />
                        </Link>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={transactionColumns(authData)}
                        data={transactions.data}
                        actions={renderActionDropdown}
                        showRoute={null}
                        keyExtractor={(row) => row.unique_key}
                    />
                </div>

                {transactions.data.length > 0 && (
                    <Pagination links={transactions.meta.links} />
                )}
            </div>
        </IndexPageLayout>
    );
}
