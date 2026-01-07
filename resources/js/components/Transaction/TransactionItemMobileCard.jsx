import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import UnifiedBadge from '@/components/UnifiedBadge';

export default function TransactionItemMobileCard({ item, type }) {
    const renderSellCard = () => {
        const productName = item.product?.name || item.product_name || '-';
        const unit = item.product?.unit || item.unit;
        const sku = item.product?.sku;
        const quantity = Math.abs(item.quantity || 0);
        const sellPrice = item.cost_per_unit || item.price || 0;
        const avgCost = item.average_cost_per_unit || 0;
        const margin = (sellPrice - avgCost) * quantity;
        const total = item.total || quantity * sellPrice;

        return (
            <Card className="shadow-sm">
                <CardContent className="p-3 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-tight">
                                {productName}
                            </p>
                            {unit && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Unit: {unit}
                                </p>
                            )}
                        </div>
                        {sku && (
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {sku}
                            </span>
                        )}
                    </div>

                    {item.channel_name && item.channel_name !== '-' && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">
                                Channel:
                            </span>
                            <UnifiedBadge text={item.channel_name} />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                            <p className="text-muted-foreground">Qty</p>
                            <p className="font-semibold">
                                {formatNumber(quantity)} {unit || ''}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Harga Jual</p>
                            <p className="font-semibold">
                                {formatCurrency(sellPrice)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <p className="text-muted-foreground">Harga Modal</p>
                            <p className="font-medium">
                                {formatCurrency(avgCost)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Margin</p>
                            <p
                                className={`font-semibold ${
                                    margin > 0
                                        ? 'text-success'
                                        : 'text-destructive'
                                }`}
                            >
                                {formatCurrency(margin)}
                            </p>
                        </div>
                    </div>

                    <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                                Total
                            </span>
                            <span className="font-bold text-sm">
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderPurchaseCard = () => {
        const productName = item.product?.name || 'Produk Telah Dihapus';
        const unit = item.product?.unit;
        const sku = item.product?.sku;
        const quantity = item.quantity || 0;
        const costPerUnit = item.cost_per_unit || 0;
        const subtotal = quantity * costPerUnit;

        return (
            <Card className="shadow-sm">
                <CardContent className="p-3 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-tight">
                                {productName}
                            </p>
                            {unit && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Unit: {unit}
                                </p>
                            )}
                        </div>
                        {sku && (
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {sku}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                        <div>
                            <p className="text-muted-foreground">Qty</p>
                            <p className="font-semibold">
                                {formatNumber(quantity)} {unit || ''}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Harga Beli</p>
                            <p className="font-semibold">
                                {formatCurrency(costPerUnit)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Subtotal</p>
                            <p className="font-bold">
                                {formatCurrency(subtotal)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderTransferCard = () => {
        const productName = item.product?.name || 'Produk Telah Dihapus';
        const unit = item.product?.unit;
        const sku = item.product?.sku;
        const quantity = Math.abs(item.quantity || 0);

        return (
            <Card className="shadow-sm">
                <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-tight">
                                {productName}
                            </p>
                        </div>
                        {sku && (
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {sku}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-bold">
                            {formatNumber(quantity)} {unit || ''}
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (type === 'sell') return renderSellCard();
    if (type === 'purchase') return renderPurchaseCard();
    if (type === 'transfer') return renderTransferCard();

    return null;
}
