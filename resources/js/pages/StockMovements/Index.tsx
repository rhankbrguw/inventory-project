import IndexPageLayout from '@/components/IndexPageLayout';
import Pagination from '@/components/Pagination';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { stockMovementColumns } from '@/constants/tableColumns/stockMovementColumns';
import useTranslation from '@/hooks/useTranslation';
import DataTable from '@/components/DataTable';
import StockMovementFilterCard from './Partials/StockMovementFilterCard';
import MobileCardList from '@/components/MobileCardList';
import StockMovementMobileCard from './Partials/StockMovementMobileCard';
import { ArrowRightLeft } from 'lucide-react';

export default function Index({
    auth,
    stockMovements,
    locations,
    products,
    movementTypes,
    filters,
}) {
    const { params, setFilter, isFiltered } = useIndexPageFilters(
        'stock-movements.index',
        filters
    );

    const { t } = useTranslation();

    return (
        <IndexPageLayout auth={auth} title={t('ui.stock_movements')} icon={ArrowRightLeft}>
            <div className="space-y-4">
                <StockMovementFilterCard
                    params={params}
                    setFilter={setFilter}
                    products={products}
                    locations={locations}
                    movementTypes={movementTypes}
                />

                <MobileCardList
                    data={stockMovements.data}
                    isFiltered={isFiltered}
                    renderItem={(movement: any) => (
                        <StockMovementMobileCard
                            key={movement.id}
                            movement={movement}
                        />
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={stockMovementColumns(t)}
                        data={stockMovements.data}
                        isFiltered={isFiltered}
                        actions={null}
                        showRoute={null}
                    />
                </div>

                {stockMovements.data.length > 0 && (
                    <Pagination links={stockMovements.meta.links} meta={stockMovements.meta} />
                )}
            </div>
        </IndexPageLayout>
    );
}
