import { Link, router } from '@inertiajs/react';
import IndexPageLayout from '@/components/IndexPageLayout';
import DataTable from '@/components/DataTable';
import MobileCardList from '@/components/MobileCardList';
import LocationMobileCard from './Partials/LocationMobileCard';
import { locationColumns } from '@/constants/tableColumns/masterDataColumns';
import useTranslation from '@/hooks/useTranslation';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { useSoftDeletes } from '@/hooks/useSoftDeletes';
import { usePermission } from '@/hooks/usePermission';
import Pagination from '@/components/Pagination';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import LocationFilterCard from './Partials/LocationFilterCard';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Archive, ArchiveRestore } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Index({ auth, locations: locationsResource, locationTypes, filters }: { auth?: any; locations: any; locationTypes?: any; filters?: any }) {
    const { can } = usePermission();
    const { t } = useTranslation();
    const canManage = can.manage_system;
    const { params, setFilter, isFiltered } = useIndexPageFilters('locations.index', filters);
    const { confirmingDeletion, setConfirmingDeletion, isProcessing, itemToDeactivate, deactivateItem, restoreItem } = useSoftDeletes({ resourceName: 'locations', data: locationsResource.data });

    const renderActionDropdown = (loc: any) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onSelect={() => router.get(route('locations.edit', loc.id))}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                {loc.deleted_at ? (
                    <DropdownMenuItem className="cursor-pointer text-success focus:text-success" onSelect={() => restoreItem(loc.id)}><ArchiveRestore className="w-4 h-4 mr-2" /> {t('ui.activate')}</DropdownMenuItem>
                ) : (
                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onSelect={() => setConfirmingDeletion(loc.id)}><Archive className="w-4 h-4 mr-2" /> {t('ui.deactivate')}</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout auth={auth} title={t('ui.locations_management')} createRoute={canManage ? 'locations.create' : undefined} buttonLabel={t('ui.add_location')}>
            <div className="space-y-4">
                <LocationFilterCard params={params} setFilter={setFilter} locationTypes={locationTypes} />
                <MobileCardList
                    data={locationsResource.data}
                    isFiltered={isFiltered}
                    renderItem={(loc: any) => (
                        <Link href={canManage ? route('locations.edit', loc.id) : '#'} key={loc.id} className={cn(!canManage && 'pointer-events-none', loc.deleted_at && 'opacity-50')}>
                            <LocationMobileCard location={loc} renderActionDropdown={canManage ? renderActionDropdown : null} />
                        </Link>
                    )}
                />
                <div className="hidden md:block">
                    <DataTable columns={locationColumns(t)} data={locationsResource.data} isFiltered={isFiltered} actions={canManage ? renderActionDropdown : null} showRoute={canManage ? 'locations.edit' : null} rowClassName={(r: any) => (r.deleted_at ? 'opacity-50' : '')} />
                </div>
                {locationsResource.data.length > 0 && <Pagination links={locationsResource.meta.links} meta={locationsResource.meta} />}
            </div>
            {canManage && <DeleteConfirmationDialog open={confirmingDeletion !== null} onOpenChange={() => setConfirmingDeletion(null)} onConfirm={deactivateItem} isDeleting={isProcessing} confirmText={t('ui.deactivate')} title={t('ui.deactivate_confirm', { name: String((itemToDeactivate as any)?.name ?? '') })} description={t('ui.deactivate_location_desc')} />}
        </IndexPageLayout>
    );
}
