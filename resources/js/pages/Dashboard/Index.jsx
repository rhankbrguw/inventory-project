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

export default function Index({
    auth,
    stats,
    charts,
    recentMovements,
    locations,
    filters,
}) {
    const { isSuperAdmin } = usePermission();

    const handleFilterChange = (newFilters) => {
        router.get(
            route('dashboard'),
            { ...filters, ...newFilters },
            { preserveState: true, preserveScroll: true }
        );
    };

    const dateRangeLabel = filters.resolved_label || 'Periode Ini';

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
                    onValueChange={(val) =>
                        handleFilterChange({ location_id: val })
                    }
                >
                    <SelectTrigger className="w-full md:w-[200px] h-9 px-3 text-xs justify-between">
                        <div className="flex items-center min-w-0">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <SelectValue placeholder="Lokasi" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {isSuperAdmin && (
                            <SelectItem value="all">Semua Lokasi</SelectItem>
                        )}
                        {locations.map((loc) => (
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
            title="Dashboard"
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
