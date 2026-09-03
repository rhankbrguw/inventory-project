import { router } from '@inertiajs/react';
import IndexPageLayout from '@/components/IndexPageLayout';
import SmartDateFilter from '@/components/SmartDateFilter';
import DashboardContent from './Partials/DashboardContent';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import useTranslation from '@/hooks/useTranslation';

export default function Index({
    auth,
    stats,
    charts,
    recentMovements,
    locations,
    filters,
}) {
    const { t } = useTranslation();
    const { isSuperAdmin } = usePermission();

    const handleFilterChange = (newFilters) => {
        router.get(
            route('dashboard'),
            { ...filters, ...newFilters },
            { preserveState: true, preserveScroll: true }
        );
    };

    const dateRangeLabel = filters.resolved_label || t('ui.this_period');

    const FilterBar = () => (
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
            <div className="col-span-1">
                <SmartDateFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />
            </div>

            <div className="relative col-span-1">
                <Select
                    value={filters.location_id || 'all'}
                    onValueChange={(selectedLocation) =>
                        handleFilterChange({ location_id: selectedLocation })
                    }
                >
                    <SelectTrigger className="w-full md:w-[200px] h-9 px-3 text-xs justify-between">
                        <div className="flex items-center min-w-0">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <SelectValue placeholder={t('ui.location')} />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {isSuperAdmin && (
                            <SelectItem value="all">{t('ui.all_locations')}</SelectItem>
                        )}
                        {(locations || []).map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                                {loc.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    return (
        <IndexPageLayout
            auth={auth}
            title={t('ui.dashboard')}
            headerActions={
                <div className="hidden sm:block">
                    <FilterBar />
                </div>
            }
        >
            <div className="block sm:hidden mb-4">
                <FilterBar />
            </div>

            <DashboardContent
                stats={stats}
                charts={charts}
                recentMovements={recentMovements}
                dateRangeLabel={dateRangeLabel}
            />
        </IndexPageLayout>
    );
}
