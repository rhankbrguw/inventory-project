import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import CurrencyInput from '@/components/CurrencyInput';
import InputError from '@/components/InputError';
import { usePage } from '@inertiajs/react';

const cleanNumberString = (numStr) => {
    if (typeof numStr !== 'string') {
        return String(numStr);
    }
    return numStr.replace(/\./g, '').replace(/,/g, '.');
};

export default function PurchaseItemManager({
    cartGroups,
    onRemoveItem,
    onRemoveSupplierGroup,
    onUpdateItem,
    getItemQuantity,
    getItemCost,
    onCheckout,
    processingItem,
    processingGroup,
    toggleSupplierSelection,
    isSupplierSelected,
    canCheckout = true,
}) {
    const { errors } = usePage().props;

    const LoadingSpinner = () => (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    );

    return (
        <div className="space-y-3">
            {Object.entries(cartGroups).map(([supplierName, groupData]) => {
                const totalGroupCost = groupData.items.reduce((sum, item) => {
                    const quantity =
                        parseFloat(cleanNumberString(getItemQuantity(item))) ||
                        0;
                    const cost = parseFloat(getItemCost(item)) || 0;
                    return sum + quantity * cost;
                }, 0);
                const isGroupProcessing =
                    processingGroup === groupData.supplier_id;
                const isSelected = isSupplierSelected(groupData.supplier_id);

                return (
                    <div
                        key={groupData.supplier_id}
                        className="rounded-lg border bg-card shadow-sm overflow-hidden"
                    >
                        <div className="flex items-center gap-2 p-2.5 bg-muted/50 border-b">
                            <Checkbox
                                id={`supplier-${groupData.supplier_id}`}
                                checked={isSelected}
                                onCheckedChange={() =>
                                    toggleSupplierSelection(
                                        groupData.supplier_id
                                    )
                                }
                                disabled={isGroupProcessing}
                                className="flex-shrink-0"
                            />
                            <Label
                                htmlFor={`supplier-${groupData.supplier_id}`}
                                className="text-sm font-semibold text-foreground truncate cursor-pointer flex-1 min-w-0 flex items-center gap-1.5"
                            >
                                {supplierName}
                            </Label>
                            {isSelected && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        onRemoveSupplierGroup(
                                            groupData.supplier_id
                                        )
                                    }
                                    disabled={
                                        isGroupProcessing ||
                                        processingItem !== null
                                    }
                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                                >
                                    {isGroupProcessing ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            )}
                        </div>

                        <div className="p-2.5 space-y-2">
                            {groupData.items.map((item, index) => {
                                const isItemProcessing =
                                    processingItem === item.id;
                                const subtotal =
                                    (parseFloat(
                                        cleanNumberString(getItemQuantity(item))
                                    ) || 0) *
                                    (parseFloat(getItemCost(item)) || 0);

                                const qtyError =
                                    errors[`items.${index}.quantity`];
                                const costError =
                                    errors[`items.${index}.cost_per_unit`];

                                return (
                                    <div
                                        key={item.id}
                                        className="pb-2 border-b last:border-b-0 last:pb-0"
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-xs leading-tight truncate text-foreground">
                                                    {item.product.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                    {item.product.unit}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    onRemoveItem(item.id)
                                                }
                                                disabled={
                                                    isItemProcessing ||
                                                    isGroupProcessing
                                                }
                                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                                            >
                                                {isItemProcessing ? (
                                                    <LoadingSpinner />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <div className="flex-1 space-y-1">
                                                <Label
                                                    htmlFor={`qty-${item.id}`}
                                                    className="text-[10px] font-medium"
                                                >
                                                    Jumlah
                                                </Label>
                                                <Input
                                                    id={`qty-${item.id}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={getItemQuantity(
                                                        item
                                                    )}
                                                    onChange={(e) => {
                                                        const rawValue =
                                                            e.target.value.replace(
                                                                /\./g,
                                                                ''
                                                            );
                                                        onUpdateItem(
                                                            item,
                                                            'quantity',
                                                            rawValue
                                                        );
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.select();
                                                    }}
                                                    disabled={
                                                        isItemProcessing ||
                                                        isGroupProcessing
                                                    }
                                                    className="h-8 text-xs"
                                                    autoComplete="off"
                                                />
                                                <InputError
                                                    message={qtyError}
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <Label
                                                    htmlFor={`cost-${item.id}`}
                                                    className="text-[10px] font-medium"
                                                >
                                                    Harga Beli
                                                </Label>
                                                <CurrencyInput
                                                    id={`cost-${item.id}`}
                                                    value={getItemCost(item)}
                                                    onValueChange={(value) =>
                                                        onUpdateItem(
                                                            item,
                                                            'cost_per_unit',
                                                            value || '0'
                                                        )
                                                    }
                                                    disabled={
                                                        isItemProcessing ||
                                                        isGroupProcessing
                                                    }
                                                    className="h-8 text-xs"
                                                />
                                                <InputError
                                                    message={costError}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right mt-1.5">
                                            <p className="text-xs font-bold text-primary">
                                                {formatCurrency(subtotal)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-2.5 border-t bg-muted/30 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                    Subtotal
                                </span>
                                <span className="text-sm font-bold text-primary">
                                    {formatCurrency(totalGroupCost)}
                                </span>
                            </div>
                            <Button
                                type="button"
                                onClick={() =>
                                    onCheckout(groupData.supplier_id)
                                }
                                disabled={
                                    isGroupProcessing ||
                                    processingItem !== null ||
                                    !canCheckout
                                }
                                className="w-full h-8 text-xs font-semibold"
                            >
                                Checkout
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
