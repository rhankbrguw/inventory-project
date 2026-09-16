import { Link, router } from '@inertiajs/react';
import IndexPageLayout from '@/components/IndexPageLayout';
import DataTable from '@/components/DataTable';
import MobileCardList from '@/components/MobileCardList';
import SupplierMobileCard from './Partials/SupplierMobileCard';
import { supplierColumns } from '@/constants/tableColumns/partyColumns';
import useTranslation from '@/hooks/useTranslation';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { useSoftDeletes } from '@/hooks/useSoftDeletes';
import Pagination from '@/components/Pagination';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import SupplierFilterCard from './Partials/SupplierFilterCard';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Archive, ArchiveRestore, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';

export default function Index({ auth, suppliers, filters }: { auth?: any; suppliers: any; filters?: any }) {
    const { can, isManager } = usePermission();
    const { t } = useTranslation();
    const canEdit = can.create_supplier;
    const canDelete = isManager;
    const { params, setFilter, isFiltered } = useIndexPageFilters('suppliers.index', filters);
    const { confirmingDeletion, setConfirmingDeletion, isProcessing, itemToDeactivate, deactivateItem, restoreItem } = useSoftDeletes({ resourceName: 'suppliers', data: suppliers.data });

    const renderActionDropdown = (s: any) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onSelect={() => router.get(route('suppliers.edit', s.id))}>
                    {canEdit ? <><Edit className="w-4 h-4 mr-2" /> {t('ui.edit')}</> : <><Eye className="w-4 h-4 mr-2" /> {t('ui.view')}</>}
                </DropdownMenuItem>
                {canDelete && (s.deleted_at ? (
                    <DropdownMenuItem className="cursor-pointer text-success focus:text-success" onSelect={() => restoreItem(s.id)}><ArchiveRestore className="w-4 h-4 mr-2" /> {t('ui.activate')}</DropdownMenuItem>
                ) : (
                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onSelect={() => setConfirmingDeletion(s.id)}><Archive className="w-4 h-4 mr-2" /> {t('ui.deactivate')}</DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout auth={auth} title={t('ui.suppliers_management')} createRoute={can.create_supplier ? 'suppliers.create' : undefined} buttonLabel={t('ui.add_supplier')}>
            <div className="space-y-4">
                <SupplierFilterCard params={params} setFilter={setFilter} />
                <MobileCardList
                    data={suppliers.data}
                    isFiltered={isFiltered}
                    renderItem={(s: any) => (
                        <Link href={canEdit ? route('suppliers.edit', s.id) : '#'} key={s.id} className={cn('block', !canEdit && 'pointer-events-none', s.deleted_at && 'opacity-50')}>
                            <SupplierMobileCard supplier={s} renderActionDropdown={renderActionDropdown} />
                        </Link>
                    )}
                />
                <div className="hidden md:block">
                    <DataTable columns={supplierColumns(t)} data={suppliers.data} isFiltered={isFiltered} actions={renderActionDropdown} showRoute={canEdit ? 'suppliers.edit' : null} rowClassName={(r: any) => (r.deleted_at ? 'opacity-50' : '')} />
                </div>
                {suppliers.data.length > 0 && <Pagination links={suppliers.meta.links} meta={suppliers.meta} />}
            </div>
            {canDelete && <DeleteConfirmationDialog open={confirmingDeletion !== null} onOpenChange={() => setConfirmingDeletion(null)} onConfirm={deactivateItem} isDeleting={isProcessing} confirmText={t('ui.deactivate')} title={t('ui.deactivate_confirm', { name: String((itemToDeactivate as any)?.name ?? '') })} description={t('ui.deactivate_supplier_desc')} />}
        </IndexPageLayout>
    );
}
