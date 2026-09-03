import type * as React from 'react';
import EmptyState from '@/components/EmptyState';
import { Inbox } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

type MobileCardListProps<T> = {
    data?: T[];
    renderItem: (item: T, idx: number) => React.ReactNode;
    emptyIcon?: React.ComponentType<{ className?: string }>;
    emptyTitle?: string;
    emptyDescription?: string;
    isFiltered?: boolean;
};

export default function MobileCardList<T>({
    data,
    renderItem,
    emptyIcon = Inbox,
    emptyTitle,
    emptyDescription,
    isFiltered = false,
}: MobileCardListProps<T>) {
    const { t } = useTranslation();

    if (!data || data.length === 0) {
        const title = emptyTitle || (isFiltered ? t('ui.no_matching_records') : t('ui.no_data'));
        const desc = emptyDescription || (isFiltered ? t('ui.no_matching_records_desc') : t('ui.no_data_desc'));

        return (
            <div className="md:hidden py-10 px-4 bg-card rounded-lg border text-center shadow-sm">
                <EmptyState
                    icon={emptyIcon}
                    title={title}
                    description={desc}
                />
            </div>
        );
    }

    return (
        <div className="md:hidden space-y-4">
            {data.map((item, idx) => renderItem(item, idx))}
        </div>
    );
}
