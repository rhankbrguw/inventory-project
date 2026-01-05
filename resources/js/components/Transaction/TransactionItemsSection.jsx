import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableFooter, TableRow, TableCell } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, cn } from '@/lib/utils';
import PrintButton from '@/components/PrintButton';
import DataTable from '@/components/DataTable';
import TransactionItemMobileCard from './TransactionItemMobileCard';

export default function TransactionItemsSection({
    type = 'purchase',
    items,
    columns,
    totals,
    totalLabel = 'Total Pembelian',
    totalAmount,
    showPrintButton = true,
}) {
    const renderMobileView = () => {
        if (type === 'sell' && totals) {
            return (
                <div className="md:hidden space-y-3">
                    {items.map((item) => (
                        <TransactionItemMobileCard
                            key={item.id}
                            item={item}
                            type={type}
                        />
                    ))}

                    <Separator className="my-4" />

                    <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                        <div className="flex justify-between font-bold">
                            <span>Total Penjualan</span>
                            <span>{formatCurrency(totals.totalSell)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Total Modal (HPP)
                            </span>
                            <span className="text-muted-foreground">
                                {formatCurrency(totals.totalCost)}
                            </span>
                        </div>

                        <Separator />

                        <div className="flex justify-between font-bold">
                            <span>Total Margin</span>
                            <span
                                className={cn(
                                    totals.totalMargin > 0
                                        ? 'text-success'
                                        : 'text-destructive'
                                )}
                            >
                                {formatCurrency(totals.totalMargin)}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        // For purchase and transfer
        return (
            <div className="md:hidden space-y-3">
                {items.map((item) => (
                    <TransactionItemMobileCard
                        key={item.id}
                        item={item}
                        type={type}
                    />
                ))}
                {totalAmount !== undefined && type !== 'transfer' && (
                    <div className="flex justify-between items-center pt-3 border-t font-bold text-base">
                        <span>{totalLabel}</span>
                        <span>{formatCurrency(totalAmount)}</span>
                    </div>
                )}
                {type === 'transfer' && <Separator className="my-4" />}
            </div>
        );
    };

    const renderDesktopFooter = () => {
        if (type === 'sell' && totals) {
            return (
                <TableFooter>
                    <TableRow>
                        <TableCell
                            colSpan={7}
                            className="text-right font-bold text-base"
                        >
                            Total Penjualan
                        </TableCell>
                        <TableCell className="text-right font-bold text-base">
                            {formatCurrency(totals.totalSell)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            colSpan={7}
                            className="text-right font-medium text-muted-foreground"
                        >
                            Total Modal (HPP)
                        </TableCell>
                        <TableCell className="text-right font-medium text-muted-foreground">
                            {formatCurrency(totals.totalCost)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            colSpan={7}
                            className="text-right font-bold text-base"
                        >
                            Total Margin
                        </TableCell>
                        <TableCell
                            className={cn(
                                'text-right font-bold text-base',
                                totals.totalMargin > 0
                                    ? 'text-success'
                                    : 'text-destructive'
                            )}
                        >
                            {formatCurrency(totals.totalMargin)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            );
        }

        if (totalAmount !== undefined && type !== 'transfer') {
            return (
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">
                            {totalLabel}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                            {formatCurrency(totalAmount)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            );
        }

        return null;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle>Rincian Item</CardTitle>
                {showPrintButton && (
                    <PrintButton>
                        <span className="hidden sm:inline">Cetak</span>
                    </PrintButton>
                )}
            </CardHeader>
            <CardContent>
                {renderMobileView()}

                <div className="hidden md:block">
                    <DataTable
                        columns={columns}
                        data={items}
                        footer={renderDesktopFooter()}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
