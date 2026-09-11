import { Link, router } from '@inertiajs/react';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { transactionColumns } from '@/constants/tableColumns/transactionColumns';
import useTranslation from '@/hooks/useTranslation';
import IndexPageLayout from '@/components/IndexPageLayout';
import DataTable from '@/components/DataTable';
import MobileCardList from '@/components/MobileCardList';
import TransactionMobileCard from './Partials/TransactionMobileCard';
import Pagination from '@/components/Pagination';
import TransactionFilterCard from './Partials/TransactionFilterCard';
import { Eye, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import TransactionHeaderActions from './Partials/TransactionHeaderActions';
import { usePermission } from '@/hooks/usePermission';

export default function Index({
    auth,
    transactions,
    locations,
    transactionTypes,
    filters = {},
}: {
    auth?: any;
    transactions: any;
    locations?: any;
    transactionTypes?: any;
    filters?: any;
}) {
    const { can } = usePermission();
    const { t } = useTranslation();

    const { params, setFilter, isFiltered } = useIndexPageFilters(
        'transactions.index',
        filters
    );

    const renderActionDropdown = (transaction: any) => (
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
                    <Eye className="w-4 h-4 mr-2" /> {t('ui.view')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout
            auth={auth}
            title={t('ui.transactions')}
            headerActions={
                <TransactionHeaderActions can={can} />
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
                    isFiltered={isFiltered}
                    renderItem={(transaction: any, idx) => (
                        <Link
                            href={transaction.url}
                            key={transaction.unique_key || transaction.id || idx}
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
                        columns={transactionColumns(t)}
                        data={transactions.data}
                        isFiltered={isFiltered}
                        actions={renderActionDropdown}
                        onRowClick={(row: any) => router.get(row.url)}
                        keyExtractor={(row: any) => row.unique_key}
                    />
                </div>
                {transactions.data.length > 0 && (
                    <Pagination links={transactions.meta.links} meta={transactions.meta} />
                )}
            </div>
        </IndexPageLayout>
    );
}
