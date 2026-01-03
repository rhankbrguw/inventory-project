import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';

export default function TransactionItemMobileCard({ item, type = 'purchase' }) {
    const quantity = Math.abs(item.quantity || 0);
    const isDeleted = item.product?.deleted_at;

    const renderContent = () => {
        switch (type) {
            case 'sell': {
                const sellPrice = item.cost_per_unit || 0;
                const avgCost = item.average_cost_per_unit || 0;
                const total = quantity * sellPrice;
                const margin = (sellPrice - avgCost) * quantity;

                return (
                    <>
                        <div className="flex justify-between items-center text-sm">
                            <span>
                                {formatNumber(quantity)} {item.product?.unit} ×{' '}
                                {formatCurrency(sellPrice)}
                            </span>
                            <span className="font-semibold">
                                {formatCurrency(total)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-xs border-t pt-2 mt-2">
                            <span className="text-muted-foreground">
                                Harga Modal
                            </span>
                            <span className="text-muted-foreground">
                                {formatCurrency(avgCost)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">
                                Margin
                            </span>
                            <span
                                className={cn(
                                    'font-semibold',
                                    margin > 0
                                        ? 'text-success'
                                        : 'text-destructive'
                                )}
                            >
                                {formatCurrency(margin)}
                            </span>
                        </div>
                    </>
                );
            }

            case 'transfer': {
                return (
                    <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-muted-foreground text-sm">
                            Qty
                        </span>
                        <span className="font-semibold text-sm">
                            {formatNumber(quantity)} {item.product?.unit}
                        </span>
                    </div>
                );
            }

            case 'purchase':
            default: {
                const costPerUnit = item.cost_per_unit || 0;
                const total = quantity * costPerUnit;

                return (
                    <div className="flex justify-between items-center text-sm">
                        <span>
                            {formatNumber(quantity)} {item.product?.unit} ×{' '}
                            {formatCurrency(costPerUnit)}
                        </span>
                        <span className="font-semibold">
                            {formatCurrency(total)}
                        </span>
                    </div>
                );
            }
        }
    };

    return (
        <Card className={cn('p-3', isDeleted && 'opacity-60 bg-muted/50')}>
            <div className="space-y-2">
                <div>
                    <p className="font-medium text-sm">
                        {item.product?.name || 'Produk Telah Dihapus'}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                        {item.product?.sku || '-'}
                    </p>
                </div>
                {renderContent()}
            </div>
        </Card>
    );
}
