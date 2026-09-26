import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePermission } from '@/hooks/usePermission';
import useTranslation from '@/hooks/useTranslation';

export default function TransactionFilterCard({
    params,
    setFilter,
    locations,
    transactionTypes,
}) {
    const { isSuperAdmin } = usePermission();
    const { t } = useTranslation();

    const sortOptions = [
        { value: 'newest', label: t('ui.sort_newest') },
        { value: 'oldest', label: t('ui.sort_oldest') },
        { value: 'total_desc', label: t('ui.sort_total_desc') },
        { value: 'total_asc', label: t('ui.sort_total_asc') },
    ];

    return (
        <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-2 pt-6">
                <Input
                    type="search"
                    placeholder={t('ui.search_ref')}
                    value={params.search || ''}
                    onChange={(e) => setFilter('search', e.target.value)}
                    className="w-full sm:w-auto sm:flex-grow"
                />
                <Select
                    value={params.location_id || 'all'}
                    onValueChange={(value) => setFilter('location_id', value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder={t('ui.filter_all_locations')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('ui.filter_all_locations')}</SelectItem>
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                                {loc.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={params.type || 'all'}
                    onValueChange={(value) => setFilter('type', value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder={t('ui.filter_all_types')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('ui.filter_all_types')}</SelectItem>
                        {transactionTypes &&
                            transactionTypes.map((type) =>
                                type && type.id ? (
                                    <SelectItem
                                        key={type.id}
                                        value={type.id.toString()}
                                    >
                                        {type.name}
                                    </SelectItem>
                                ) : null
                            )}
                    </SelectContent>
                </Select>
                <Select
                    value={params.status || 'all'}
                    onValueChange={(value) => setFilter('status', value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder={t('ui.status_all')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('ui.status_all')}</SelectItem>
                        <SelectItem value="pending">{t('ui.status_pending')}</SelectItem>
                        <SelectItem value="completed">{t('ui.status_completed')}</SelectItem>
                        <SelectItem value="rejected">{t('ui.status_rejected')}</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={params.sort || 'newest'}
                    onValueChange={(value) => setFilter('sort', value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder={t('ui.filter_sort')} />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
}
