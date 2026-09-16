import { Link, router } from '@inertiajs/react';
import IndexPageLayout from '@/components/IndexPageLayout';
import DataTable from '@/components/DataTable';
import MobileCardList from '@/components/MobileCardList';
import CustomerMobileCard from './Partials/CustomerMobileCard';
import { customerColumns } from '@/constants/tableColumns/partyColumns';
import useTranslation from '@/hooks/useTranslation';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { useSoftDeletes } from '@/hooks/useSoftDeletes';
import Pagination from '@/components/Pagination';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import CustomerFilterCard from './Partials/CustomerFilterCard';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Archive, ArchiveRestore, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';

export default function Index({ auth, customers, customerTypes, filters }: { auth?: any; customers: any; customerTypes?: any; filters?: any }) {
    const { can, isManager } = usePermission();
    const { t } = useTranslation();
    const canEdit = can.create_customer;
    const canDelete = isManager;
    const { params, setFilter, isFiltered } = useIndexPageFilters('customers.index', filters);
    const { confirmingDeletion, setConfirmingDeletion, isProcessing, itemToDeactivate, deactivateItem, restoreItem } = useSoftDeletes({ resourceName: 'customers', data: customers.data });

    const renderActionDropdown = (c: any) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onSelect={() => router.get(route('customers.edit', c.id))}>
                    {canEdit ? <><Edit className="w-4 h-4 mr-2" /> {t('ui.edit')}</> : <><Eye className="w-4 h-4 mr-2" /> {t('ui.view')}</>}
                </DropdownMenuItem>
                {canDelete && (c.deleted_at ? (
                    <DropdownMenuItem className="cursor-pointer text-success focus:text-success" onSelect={() => restoreItem(c.id)}><ArchiveRestore className="w-4 h-4 mr-2" /> {t('ui.activate')}</DropdownMenuItem>
                ) : (
                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onSelect={() => setConfirmingDeletion(c.id)}><Archive className="w-4 h-4 mr-2" /> {t('ui.deactivate')}</DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout auth={auth} title={t('ui.customers_management')} createRoute={can.create_customer ? 'customers.create' : undefined} buttonLabel={t('ui.add_customer')}>
            <div className="space-y-4">
                <CustomerFilterCard params={params} setFilter={setFilter} customerTypes={customerTypes} />
                <MobileCardList
                    data={customers.data}
                    isFiltered={isFiltered}
                    renderItem={(c: any) => (
                        <Link href={canEdit ? route('customers.edit', c.id) : '#'} key={c.id} className={cn('block', !canEdit && 'pointer-events-none', c.deleted_at && 'opacity-50')}>
                            <CustomerMobileCard customer={c} renderActionDropdown={renderActionDropdown} />
                        </Link>
                    )}
                />
                <div className="hidden md:block">
                    <DataTable columns={customerColumns(t)} data={customers.data} isFiltered={isFiltered} actions={renderActionDropdown} showRoute={canEdit ? 'customers.edit' : null} rowClassName={(r: any) => (r.deleted_at ? 'opacity-50' : '')} />
                </div>
                {customers.data.length > 0 && <Pagination links={customers.meta.links} meta={customers.meta} />}
            </div>
            {canDelete && <DeleteConfirmationDialog open={confirmingDeletion !== null} onOpenChange={() => setConfirmingDeletion(null)} onConfirm={deactivateItem} isDeleting={isProcessing} confirmText={t('ui.deactivate')} title={t('ui.deactivate_confirm', { name: String((itemToDeactivate as any)?.name ?? '') })} description={t('ui.deactivate_customer_desc')} />}
        </IndexPageLayout>
    );
}
