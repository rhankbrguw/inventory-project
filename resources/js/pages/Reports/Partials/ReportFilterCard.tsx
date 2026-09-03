import { router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MapPin, Package } from 'lucide-react';
import SmartDateFilter from '@/components/SmartDateFilter';
import PrintButton from '@/components/PrintButton';
import { usePermission } from '@/hooks/usePermission';
import useTranslation from '@/hooks/useTranslation';

export default function ReportFilterCard({
    locations,
    products,
    filters,
    auth: _auth,
    ...rest
}: {
    locations: any;
    products: any;
    filters: any;
    auth?: any;
    [key: string]: unknown;
}) {
    const { isSuperAdmin } = usePermission();
    const { t } = useTranslation();

    const handleFilterChange = (newFilters) => {
        router.get(
            route('reports.index'),
            { ...filters, ...newFilters },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const getLocationValue = () => {
        if (isSuperAdmin) {
            return filters.location_id || 'all';
        }
        return filters.location_id || locations[0]?.id?.toString() || 'all';
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
            <div className="w-full sm:w-[180px]">
                <SmartDateFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />
            </div>

            <div className="w-full sm:w-[180px]">
                <Select
                    value={getLocationValue()}
                    onValueChange={(selectedLocation) =>
                        handleFilterChange({ location_id: selectedLocation })
                    }
                >
                    <SelectTrigger className="h-9 px-3 text-xs w-full">
                        <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <SelectValue placeholder={t('ui.filter_all_locations')} />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {isSuperAdmin && (
                            <SelectItem value="all">{t('ui.filter_all_locations')}</SelectItem>
                        )}
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                                {loc.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {products && products.length > 0 && (
                <div className="w-full sm:w-[180px]">
                    <Select
                        value={filters.product_id || 'all'}
                        onValueChange={(selectedProduct) =>
                            handleFilterChange({ product_id: selectedProduct })
                        }
                    >
                        <SelectTrigger className="h-9 px-3 text-xs w-full">
                            <div className="flex items-center gap-2 min-w-0">
                                <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <SelectValue placeholder={t('ui.filter_all_products')} />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('ui.filter_all_products')}</SelectItem>
                            {products.map((prod) => (
                                <SelectItem
                                    key={prod.id}
                                    value={prod.id.toString()}
                                >
                                    {prod.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <PrintButton className="h-9 px-3 text-xs sm:w-auto w-full">
                {t('ui.print')}
            </PrintButton>
        </div>
    );
}
