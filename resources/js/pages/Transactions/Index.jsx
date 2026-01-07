import { Link, router, usePage } from '@inertiajs/react';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { transactionColumns } from '@/constants/tableColumns.jsx';
import IndexPageLayout from '@/components/IndexPageLayout';
import DataTable from '@/components/DataTable';
import MobileCardList from '@/components/MobileCardList';
import TransactionMobileCard from './Partials/TransactionMobileCard';
import Pagination from '@/components/Pagination';
import TransactionFilterCard from './Partials/TransactionFilterCard';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    Eye,
    MoreVertical,
    Truck,
    ShoppingCart,
    ArrowRightLeft,
    Plus,
} from 'lucide-react';

export default function Index({
    auth,
    transactions,
    locations,
    transactionTypes,
    filters = {},
}) {
    const { can } = usePage().props.auth;

    const { params, setFilter } = useIndexPageFilters(
        'transactions.index',
        filters
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
                    onSelect={() => router.get(transaction.url)}
                >
                    <Eye className="w-4 h-4 mr-2" /> Lihat Detail
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout
            auth={auth}
            title="Riwayat Transaksi"
            headerActions={
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2">
                        {can.create_purchase && (
                            <Button
                                onClick={() =>
                                    router.get(
                                        route('transactions.purchases.create')
                                    )
                                }
                                className="btn-purchase"
                            >
                                <Truck className="w-4 h-4 mr-2" />
                                Tambah Pembelian
                            </Button>
                        )}
                        {can.create_sell && (
                            <Button
                                onClick={() =>
                                    router.get(
                                        route('transactions.sells.create')
                                    )
                                }
                                className="btn-sell"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Tambah Penjualan
                            </Button>
                        )}
                        {can.create_transfer && (
                            <Button
                                onClick={() =>
                                    router.get(
                                        route('transactions.transfers.create')
                                    )
                                }
                                className="btn-transfer"
                            >
                                <ArrowRightLeft className="w-4 h-4 mr-2" />
                                Transfer Stok
                            </Button>
                        )}
                    </div>

                    <div className="sm:hidden">
                        {(can.create_purchase ||
                            can.create_sell ||
                            can.create_transfer) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="rounded-full h-10 w-10"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {can.create_purchase && (
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onSelect={() =>
                                                router.get(
                                                    route(
                                                        'transactions.purchases.create'
                                                    )
                                                )
                                            }
                                        >
                                            <Truck className="w-4 h-4 mr-2" />
                                            Pembelian
                                        </DropdownMenuItem>
                                    )}
                                    {can.create_sell && (
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onSelect={() =>
                                                router.get(
                                                    route(
                                                        'transactions.sells.create'
                                                    )
                                                )
                                            }
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Penjualan
                                        </DropdownMenuItem>
                                    )}
                                    {can.create_transfer && (
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onSelect={() =>
                                                router.get(
                                                    route(
                                                        'transactions.transfers.create'
                                                    )
                                                )
                                            }
                                        >
                                            <ArrowRightLeft className="w-4 h-4 mr-2" />
                                            Transfer Stok
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
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
                        columns={transactionColumns(auth)}
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
