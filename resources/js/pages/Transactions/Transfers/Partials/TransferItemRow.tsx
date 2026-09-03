import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import ProductCombobox from '@/components/ProductCombobox';
import InputError from '@/components/InputError';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import StockAvailability from '@/components/StockAvailability';
import useTranslation from '@/hooks/useTranslation';

export function TransferItemRow({ item, index, products, selectedProductIds, fromLocationId, canDelete, onProductSelect, onQuantityChange, onRemove, errorProduct, errorQty }) {
    const { t } = useTranslation();
    const selectedProduct = products.find((p) => p.id === item.product_id);

    return (
        <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <Label>{t('ui.product')} #{index + 1}</Label>
                <Button type="button" variant="ghost" size="icon" onClick={onRemove} disabled={!canDelete} className="text-destructive hover:text-destructive h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                <div className="space-y-1">
                    <ProductCombobox products={products} value={item.product_id} onChange={onProductSelect} disabledIds={selectedProductIds} />
                    {item.product_id && <StockAvailability productId={item.product_id} locationId={fromLocationId} unit={selectedProduct?.unit} />}
                    <InputError message={errorProduct} />
                </div>
                <div className="space-y-1">
                    <div className="relative">
                        <Input type="number" value={item.quantity} onChange={(e) => onQuantityChange(e.target.value)} min="0.01" step="0.01" placeholder={t('ui.quantity')} disabled={!selectedProduct} className={selectedProduct ? 'pr-12' : ''} />
                        {selectedProduct && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground pointer-events-none">{selectedProduct.unit}</span>}
                    </div>
                    <InputError message={errorQty} />
                </div>
            </div>
        </div>
    );
}
