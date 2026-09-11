import { Input } from '@/components/ui/input';
import { Search, ShieldAlert, PackageOpen, Warehouse, Cuboid } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import ProductCard from '../../Purchases/Partials/ProductCard';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import useTranslation from '@/hooks/useTranslation';
import PurchaseProductFilter from './PurchaseProductFilter';

export default function PurchaseProductGrid({ products, productTypes, params, setFilter, onProductClick, selectedProductIds, processingItem, paginationLinks, canPurchase = true, selectedSourceType, selectedSourceId }) {
    const { t } = useTranslation();
    const hasProducts = products.length > 0;
    const isInternalMode = selectedSourceType === 'internal';
    const isWarehouseSelected = isInternalMode && selectedSourceId;

    if (!canPurchase) {
        return (
            <div className="flex flex-col h-full flex-1 items-center justify-center p-6">
                <ShieldAlert className="h-16 w-16 text-destructive/50" />
                <p className="mt-4 text-sm font-semibold text-foreground">{t('ui.access_denied')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b flex-shrink-0">
                <h3 className="text-base font-semibold">{t('ui.product_catalog')}</h3>
                <div className="mt-2 space-y-2 relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input placeholder={t('ui.search_product_placeholder')} value={params.search || ''} onChange={(e) => setFilter('search', e.target.value)} className="pl-9 h-9 text-sm" disabled={isInternalMode && !isWarehouseSelected} />
                </div>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden p-3">
                <div className="flex-shrink-0 space-y-3 mb-4">
                    <PurchaseProductFilter productTypes={productTypes} params={params} setFilter={setFilter} isInternalMode={isInternalMode} isWarehouseSelected={isWarehouseSelected} />
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain pr-1 -mr-3">
                    {isInternalMode && !isWarehouseSelected ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3"><Warehouse className="w-8 h-8 text-muted-foreground/50" /></div>
                            <p className="text-sm font-medium text-foreground mb-1">{t('ui.select_source_warehouse')}</p>
                            <p className="text-xs text-muted-foreground">{t('ui.select_origin_first')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
                            {hasProducts ? products.map((product) => (
                                <div key={product.id} className="relative group isolate">
                                    {isInternalMode && (
                                        <div className="absolute top-2 right-2 z-20 pointer-events-none">
                                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm shadow-sm border border-border/50 text-[10px] h-6 px-2 gap-1.5 hover:bg-background/80">
                                                <Cuboid className="w-3 h-3 text-muted-foreground" /><span className="font-bold">{formatNumber(product.stock_quantity || 0)}</span><span className="text-muted-foreground font-normal">{product.unit}</span>
                                            </Badge>
                                        </div>
                                    )}
                                    <ProductCard product={product} onClick={() => onProductClick(product)} selected={selectedProductIds.includes(product.id)} processing={processingItem === product.id} showPrice={isInternalMode} />
                                </div>
                            )) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3"><PackageOpen className="w-8 h-8 text-muted-foreground/50" /></div>
                                    <p className="text-sm font-medium text-foreground mb-1">{t('ui.product_not_found')}</p>
                                    <p className="text-xs text-muted-foreground">{isInternalMode ? t('ui.no_stock_in_warehouse') : t('ui.change_filter_hint')}</p>
                                </div>
                            )}
                        </div>
                    )}
                    {paginationLinks.length > 3 && hasProducts && <Pagination links={paginationLinks} className="pb-4" />}
                </div>
            </div>
        </div>
    );
}
