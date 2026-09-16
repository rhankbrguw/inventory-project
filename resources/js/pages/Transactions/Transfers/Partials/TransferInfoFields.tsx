import React from 'react';
import UnifiedBadge from '@/components/UnifiedBadge';
import { formatDate } from '@/lib/utils';

export function buildTransferInfoFields(data, t) {
    return [
        { label: t('ui.from_location'), value: data.from_location?.name },
        { label: t('ui.to_location'), value: data.to_location?.name },
        { label: t('ui.transfer_date'), value: formatDate(data.transfer_date) },
        {
            label: t('ui.status'),
            value: <UnifiedBadge text={data.status} code={data.status} />,
        },
        { label: t('ui.created_by'), value: data.user?.name },
        {
            label: t('ui.received_by'),
            value: data.received_by?.name,
            hidden: !data.received_by,
        },
        {
            label: t('ui.rejected_by'),
            value: data.rejected_by?.name,
            hidden: !data.rejected_by,
        },
        {
            label: t('ui.rejection_reason'),
            value: (
                <span className="text-destructive font-medium">
                    {data.rejection_reason}
                </span>
            ),
            span: 'full',
            hidden: !data.rejection_reason,
        },
        {
            label: t('ui.notes'),
            value: data.notes,
            span: 'full',
            hidden: !data.notes,
        },
        {
            label: t('ui.proof_of_delivery'),
            value: (data.receipt_photo_url || data.receipt_photo_path) ? (
                <div className="mt-2 inline-block max-w-sm rounded-lg overflow-hidden border border-border shadow-xs bg-muted">
                    <img
                        src={data.receipt_photo_url || `/storage/${data.receipt_photo_path}`}
                        alt={t('ui.proof_of_delivery')}
                        className="rounded-lg max-h-64 w-full object-cover"
                    />
                </div>
            ) : null,
            span: 'full',
            hidden: !data.receipt_photo_url && !data.receipt_photo_path,
        },
    ];
}
