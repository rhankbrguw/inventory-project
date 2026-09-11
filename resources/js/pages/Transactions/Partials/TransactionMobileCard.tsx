import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UnifiedBadge from '@/components/UnifiedBadge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { router } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';

export default function TransactionMobileCard({
    transaction,
    renderActionDropdown,
}) {
    const { t } = useTranslation();
    const isTransfer = transaction.type?.toLowerCase() === 'transfer';

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1.5">
                    <CardTitle className="text-sm font-mono">
                        {transaction.reference_code}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.transaction_date)}
                    </p>
                    {transaction.status && (
                        <UnifiedBadge
                            text={transaction.status}
                            code={transaction.status}
                        />
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <UnifiedBadge
                        text={t(`ui.${transaction.type?.toLowerCase()}`) || transaction.type}
                        code={transaction.type}
                    />
                    {renderActionDropdown(transaction)}
                </div>
            </CardHeader>
            <CardContent
                onClick={() => router.get(transaction.url)}
                className="cursor-pointer"
            >
                {!isTransfer && (
                    <div className="text-lg font-bold mb-2">
                        {formatCurrency(transaction.total_amount)}
                    </div>
                )}
                <div className="text-xs space-y-1">
                    <p>
                        {isTransfer ? t('ui.from_location') : t('ui.location')}:{' '}
                        <span className="font-medium">
                            {transaction.location_name || transaction.location || '-'}
                        </span>
                    </p>
                    <p>
                        {isTransfer
                            ? t('ui.to_location')
                            : (transaction.party_type ||
                                (transaction.type?.toLowerCase() === 'purchase'
                                    ? t('ui.supplier')
                                    : t('ui.customer')))}:{' '}
                        <span className="font-medium">
                            {transaction.target_location_name || transaction.party_name || '-'}
                        </span>
                    </p>
                    <p>
                        {t('ui.table.pic')}:{' '}
                        <span className="font-medium">
                            {transaction.user_name || transaction.user || '-'}
                        </span>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
