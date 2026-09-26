import { Input } from '@/components/ui/input';
import { Search, PackageX } from 'lucide-react';
import ProductCard from '../../Purchases/Partials/ProductCard';
import Pagination from '@/components/Pagination';
import SellProductFilter from './SellProductFilter';
import useTranslation from '@/hooks/useTranslation';

export default function SellProductGrid({ locations, onLocationChange, products, productTypes, salesChannels, selectedChannelId, onChannelChange, getProductPrice, params, setFilter, onProductClick, selectedProductIds, processingItem, paginationLinks }) {
    const { t } = useTranslation();
    const hasProducts = products.length > 0;
    const isFiltered = !!params.search || (params.type_id && params.type_id !== 'all');

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b flex-shrink-0">
                <h3 className="text-base font-semibold">{t('ui.product_catalog')}</h3>
                <div className="mt-2 relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input placeholder={t('ui.search_product_placeholder')} value={params.search || ''} onChange={(e) => setFilter('search', e.target.value)} className="pl-9 h-9 text-sm" />
                </div>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden p-3">
                <div className="flex-shrink-0 space-y-3 mb-4">
                    <SellProductFilter locations={locations} selectedLocationId={params.location_id} onLocationChange={onLocationChange} productTypes={productTypes} salesChannels={salesChannels} selectedChannelId={selectedChannelId} onChannelChange={onChannelChange} params={params} setFilter={setFilter} />
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain pr-1 -mr-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
                        {hasProducts ? products.map((product) => (
                            <ProductCard key={product.id} product={product} price={getProductPrice(product)} onClick={() => onProductClick(product)} selected={selectedProductIds.includes(product.id)} processing={processingItem === product.id} />
                        )) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                <PackageX className="w-10 h-10 text-muted-foreground/60 mb-2" />
                                <p className="text-sm font-medium text-foreground mb-1">
                                    {isFiltered ? t('ui.product_not_found') : t('ui.no_stock_available_at_location')}
                                </p>
                                <p className="text-xs text-muted-foreground max-w-xs">
                                    {isFiltered ? t('ui.change_filter_hint') : t('ui.no_stock_hint')}
                                </p>
                            </div>
                        )}
                    </div>
                    {paginationLinks.length > 3 && hasProducts && <Pagination links={paginationLinks} className="pb-4" />}
                </div>
            </div>
        </div>
    );
}
