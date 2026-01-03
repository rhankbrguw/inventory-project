import { Link, router } from '@inertiajs/react';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { stockColumns } from '@/constants/tableColumns.jsx';
import IndexPageLayout from '@/components/IndexPageLayout';
import DataTable from '@/components/DataTable';
import MobileCardList from '@/components/MobileCardList';
import StockMobileCard from './Partials/StockMobileCard';
import Pagination from '@/components/Pagination';
import StockFilterCard from './Partials/StockFilterCard';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Wrench, Eye, MoreVertical } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

export default function Index({
    auth,
    inventories,
    locations = [],
    products = [],
    filters = {},
}) {
    const { params, setFilter } = useIndexPageFilters('stock.index', filters);

    const { isManager } = usePermission();
    const canAdjustStock = isManager;

    const renderActionDropdown = (item) => (
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
                    onSelect={() => router.get(route('stock.show', item.id))}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    Lihat
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Stok"
            createRoute={canAdjustStock ? 'stock.adjust.form' : null}
            buttonLabel="Penyesuaian Stok"
            icon={Wrench}
        >
            <div className="space-y-4">
                <StockFilterCard
                    params={params}
                    setFilter={setFilter}
                    products={products}
                    locations={locations}
                />

                <MobileCardList
                    data={inventories.data}
                    renderItem={(item) => (
                        <Link href={route('stock.show', item.id)} key={item.id}>
                            <StockMobileCard
                                item={item}
                                renderActionDropdown={renderActionDropdown}
                            />
                        </Link>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={stockColumns}
                        data={inventories.data}
                        actions={renderActionDropdown}
                        showRoute="stock.show"
                        showRouteKey="id"
                    />
                </div>

                {inventories.data.length > 0 && (
                    <Pagination links={inventories.meta.links} />
                )}
            </div>
        </IndexPageLayout>
    );
}
