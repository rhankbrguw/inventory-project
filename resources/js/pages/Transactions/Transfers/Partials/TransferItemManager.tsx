import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';
import { TransferItemRow } from './TransferItemRow';

export default function TransferItemManager({ items, products, setData, errors, selectedProductIds, fromLocationId, isLocked }) {
    const { t } = useTranslation();

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const handleProductSelect = (index, product) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], product_id: product.id, unit: product.unit };
        setData('items', newItems);
    };

    const addItem = () => setData('items', [...items, { product_id: '', quantity: 1, unit: '' }]);
    const removeItem = (index) => { if (items.length > 1) setData('items', items.filter((_, i) => i !== index)); };
    const isAddItemDisabled = !items[items.length - 1]?.product_id;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1.5">
                    <CardTitle>{t('ui.transfer_items')}</CardTitle>
                    <CardDescription>{isLocked ? t('ui.transfer_items_empty_origin') : t('ui.transfer_items_empty_product')}</CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={addItem} className="flex items-center gap-2 shrink-0" disabled={isAddItemDisabled || isLocked}>
                    <PlusCircle className="h-4 w-4" /><span className="hidden md:inline">{t('ui.add_item')}</span>
                </Button>
            </CardHeader>
            <CardContent className={cn('space-y-4', isLocked && 'opacity-50 pointer-events-none')}>
                {items.map((item, index) => (
                    <TransferItemRow
                        key={index} item={item} index={index} products={products} selectedProductIds={selectedProductIds}
                        fromLocationId={fromLocationId} canDelete={items.length > 1}
                        onProductSelect={(p) => handleProductSelect(index, p)}
                        onQuantityChange={(q) => handleItemChange(index, 'quantity', q)}
                        onRemove={() => removeItem(index)}
                        errorProduct={errors[`items.${index}.product_id`]} errorQty={errors[`items.${index}.quantity`]}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
