import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import PrintButton from '@/components/PrintButton';
import DataTable, { type DataTableColumn } from '@/components/DataTable';
import TransactionItemMobileCard from './TransactionItemMobileCard';
import SellAccountingSummary from './SellAccountingSummary';
import useTranslation from '@/hooks/useTranslation';

type TransactionItem = {
    id?: string | number;
    [key: string]: unknown;
};

type TransactionItemsSectionProps = {
    type?: 'purchase' | 'sell' | 'transfer' | string;
    items?: TransactionItem[];
    columns?: DataTableColumn<TransactionItem>[];
    totals?: Record<string, number>;
    totalLabel?: string;
    totalAmount?: number;
    sell?: Record<string, unknown>;
    transaction?: Record<string, unknown>;
    showPrintButton?: boolean;
};

export default function TransactionItemsSection({ type = 'purchase', items = [], columns, totals, totalLabel, totalAmount, sell, transaction, showPrintButton = true }: TransactionItemsSectionProps) {
    const { t } = useTranslation();
    const resolvedTotalLabel = totalLabel ?? (type === 'sell' ? t('ui.total_sell') : t('ui.total_purchase'));
    const tx = sell || transaction;

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-3.5 sm:p-4 pb-2 sm:pb-2.5">
                <CardTitle className="text-xs sm:text-sm font-semibold">{t('ui.transaction_detail')}</CardTitle>
                {showPrintButton && <PrintButton><span className="hidden sm:inline">{t('ui.print')}</span></PrintButton>}
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 pt-0 sm:pt-0 space-y-3">
                <div className="md:hidden space-y-2.5">
                    {items.map((item) => <TransactionItemMobileCard key={String(item.id ?? item.product_id ?? Math.random())} item={item} type={type} />)}
                </div>

                <div className="hidden md:block">
                    <DataTable columns={columns ?? []} data={items} />
                </div>

                {type === 'sell' && totals && <SellAccountingSummary totals={totals} sell={tx as Record<string, unknown>} />}

                {totalAmount !== undefined && type === 'purchase' && (
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-3 border-t">
                        <div className="text-xs text-muted-foreground max-w-xs space-y-0.5">
                            <p className="font-semibold text-foreground text-xs">{t('ui.financial_summary')}</p>
                            <p className="text-[11px] leading-snug text-muted-foreground">
                                {t('ui.purchase_accounting_hint')}
                            </p>
                        </div>

                        <div className="w-full sm:w-72 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>{t('ui.table.subtotal')}</span>
                                <span className="font-medium text-foreground font-mono">{formatCurrency(totalAmount)}</span>
                            </div>
                            {tx && typeof tx === 'object' && 'has_installments' in tx && tx.has_installments && 'interest_amount' in tx && Number(tx.interest_amount) > 0 && (
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>{t('ui.interest_amount')} ({String((tx as Record<string, unknown>).installment_terms ?? 0)}x)</span>
                                    <span className="font-mono">+{formatCurrency(Number((tx as Record<string, unknown>).interest_amount ?? 0))}</span>
                                </div>
                            )}
                            <Separator className="my-1" />
                            <div className="flex items-center justify-between font-bold text-xs">
                                <span className="text-foreground">{resolvedTotalLabel}</span>
                                <span className="font-mono font-bold text-sm text-foreground">
                                    {formatCurrency(Number((tx as Record<string, unknown>)?.total_payable ?? totalAmount))}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {totalAmount !== undefined && type !== 'sell' && type !== 'purchase' && type !== 'transfer' && (
                    <div className="flex justify-end pt-3 border-t">
                        <div className="w-full sm:w-72 flex justify-between items-center bg-muted/30 p-2.5 rounded-lg font-bold text-xs">
                            <span className="text-muted-foreground">{resolvedTotalLabel}</span>
                            <span className="font-mono text-sm text-foreground">{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
