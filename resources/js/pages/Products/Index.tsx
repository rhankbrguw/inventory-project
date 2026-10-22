import { Link } from '@inertiajs/react';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { useSoftDeletes } from '@/hooks/useSoftDeletes';
import { productColumns } from '@/constants/tableColumns/productColumns';
import useTranslation from '@/hooks/useTranslation';
import IndexPageLayout from '@/components/IndexPageLayout';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import DataTable from '@/components/DataTable';
import MobileCardList from '@/components/MobileCardList';
import ProductMobileCard from './Partials/ProductMobileCard';
import Pagination from '@/components/Pagination';
import QuickAddTypeModal from '@/components/QuickAddTypeModal';
import ProductFilterCard from './Partials/ProductFilterCard';
import { ProductActionsDropdown } from './Partials/ProductActionsDropdown';
import { Button } from '@/components/ui/button';
import { PlusCircle, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';

export default function Index({ auth, products, allProducts, productTypes, salesChannels, filters = {} }: { auth?: any; products: any; allProducts?: any; productTypes?: any; salesChannels?: any; filters?: any }) {
    const { can, isManager } = usePermission();
    const { t } = useTranslation();
    const canCrud = isManager;
    const { params, setFilter, isFiltered } = useIndexPageFilters('products.index', filters);
    const { confirmingDeletion, setConfirmingDeletion, isProcessing, itemToDeactivate, deactivateItem, restoreItem } = useSoftDeletes({ resourceName: 'products', data: products.data });

    const renderActions = (p: any) => <ProductActionsDropdown product={p} restoreItem={restoreItem} setConfirmingDeletion={setConfirmingDeletion} />;

    return (
        <IndexPageLayout
            auth={auth} title={t('ui.products_management')} createRoute={can.create_product ? 'products.create' : undefined} buttonLabel={t('ui.add_product')}
            headerActions={can.manage_types && (
                <div className="flex gap-2">
                    <QuickAddTypeModal group="product_type" title={t('ui.add_product_type')} description={t('ui.product_type_desc')} existingTypes={productTypes?.data} trigger={<Button variant="outline" className="flex items-center gap-2 px-2 sm:px-4"><PlusCircle className="w-5 h-5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">{t('ui.product_type')}</span></Button>} />
                    <QuickAddTypeModal group="sales_channel" title={t('ui.add_sales_channel')} description={t('ui.sales_channel_desc')} existingTypes={salesChannels?.data} trigger={<Button variant="outline" className="flex items-center gap-2 px-2 sm:px-4 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5"><Tags className="w-5 h-5 sm:w-4 sm:h-4 text-primary" /><span className="hidden sm:inline text-primary font-medium">{t('ui.channel_type')}</span></Button>} />
                </div>
            )}
        >
            <div className="space-y-4">
                <ProductFilterCard params={params} setFilter={setFilter} allProducts={allProducts} productTypes={productTypes} />
                <MobileCardList
                    data={products.data}
                    isFiltered={isFiltered}
                    renderItem={(p: any) => (
                        <Link href={canCrud ? route('products.edit', p.id) : '#'} key={p.id} className={cn('block', !canCrud && 'pointer-events-none', p.deleted_at && 'opacity-50')}>
                            <ProductMobileCard product={p} renderActionDropdown={canCrud ? renderActions : null} />
                        </Link>
                    )}
                />
                <div className="hidden md:block">
                    <DataTable columns={productColumns(t)} data={products.data} isFiltered={isFiltered} actions={canCrud ? renderActions : null} showRoute={canCrud ? 'products.edit' : null} rowClassName={(r: any) => (r.deleted_at ? 'opacity-50' : '')} />
                </div>
                {products.data.length > 0 && <Pagination links={products.meta.links} meta={products.meta} />}
            </div>
            {canCrud && <DeleteConfirmationDialog open={confirmingDeletion !== null} onOpenChange={() => setConfirmingDeletion(null)} onConfirm={deactivateItem} isDeleting={isProcessing} confirmText={t('ui.deactivate')} title={t('ui.deactivate_confirm', { name: String((itemToDeactivate as any)?.name ?? '') })} description={t('ui.deactivate_desc')} />}
        </IndexPageLayout>
    );
}
