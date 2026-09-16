import ContentPageLayout from '@/components/ContentPageLayout';
import { Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import StockMovementMobileCard from '../StockMovements/Partials/StockMovementMobileCard';
import { Eye } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { stockMovementPreviewColumns } from '@/constants/tableColumns/stockMovementColumns';
import useTranslation from '@/hooks/useTranslation';

export default function Show({ auth, inventory, stockMovements }) {
    const inventoryData = inventory?.data || inventory || {};
    const movementsData = Array.isArray(stockMovements) ? stockMovements : (stockMovements?.data || []);
    const { t } = useTranslation();

    return (
        <ContentPageLayout
            auth={auth}
            title={t('ui.stock_info')}
            backRoute="stock.index"
        >
            <div className="space-y-4 sm:space-y-6">
                <Card>
                    <CardHeader className="p-3.5 sm:p-6 pb-2 sm:pb-3">
                        <CardTitle className="text-base sm:text-lg">{inventoryData.product?.name}</CardTitle>
                        <CardDescription className="text-xs font-mono">
                            SKU: {inventoryData.product?.sku}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3.5 sm:p-6 pt-0 sm:pt-0 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 text-xs sm:text-sm">
                        <div>
                            <p className="text-muted-foreground">{t('ui.location')}</p>
                            <p className="font-semibold text-foreground">
                                {inventoryData.location?.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">
                                {t('ui.actual_stock_qty')}
                            </p>
                            <p className="font-bold text-sm sm:text-base text-foreground">
                                {formatNumber(inventoryData.quantity)}{' '}
                                {inventoryData.product?.unit}
                            </p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <p className="text-muted-foreground">
                                {t('ui.average_cost')}
                            </p>
                            <p className="font-semibold text-foreground">
                                {formatCurrency(inventoryData.average_cost)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="p-3.5 sm:p-6 pb-2 sm:pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm sm:text-base">{t('ui.recent_movements')}</CardTitle>
                            {inventoryData.product?.id && inventoryData.location?.id && (
                                <Link
                                    href={route('stock-movements.index', {
                                        product_id: inventoryData.product.id,
                                        location_id: inventoryData.location.id,
                                    })}
                                >
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 sm:hidden"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="hidden sm:inline-flex text-xs h-8"
                                    >
                                        {t('ui.view_item_history')}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-3.5 sm:p-6 pt-0 sm:pt-0">
                        <div className="md:hidden space-y-2.5">
                            {movementsData.length > 0 ? (
                                movementsData.map((movement) => (
                                    <StockMovementMobileCard
                                        key={movement.id}
                                        movement={movement}
                                    />
                                ))
                            ) : (
                                <p className="text-xs text-center text-muted-foreground py-8">
                                    {t('ui.no_activity')}
                                </p>
                            )}
                        </div>

                        <div className="hidden md:block">
                            {movementsData.length > 0 ? (
                                <DataTable
                                    columns={stockMovementPreviewColumns(t)}
                                    data={movementsData}
                                />
                            ) : (
                                <div className="text-center text-xs text-muted-foreground py-8">
                                    {t('ui.no_activity')}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ContentPageLayout>
    );
}
