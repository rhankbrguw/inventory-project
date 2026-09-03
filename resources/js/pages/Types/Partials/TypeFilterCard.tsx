import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useTranslation from '@/hooks/useTranslation';

export default function TypeFilterCard({ params, setFilter, groups }) {
    const { t } = useTranslation();

    const sortOptions = [
        { value: 'name_asc', label: t('ui.sort_name_asc') },
        { value: 'name_desc', label: t('ui.sort_name_desc') },
    ];

    const statusOptions = [
        { value: 'all', label: t('ui.status_all') },
        { value: 'active', label: t('ui.status_active') },
        { value: 'inactive', label: t('ui.status_inactive') },
    ];

    return (
        <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-2 pt-6">
                <Input
                    type="search"
                    placeholder={t('ui.search_name_code')}
                    value={params.search || ''}
                    onChange={(e) => setFilter('search', e.target.value)}
                    className="w-full sm:w-auto sm:flex-grow"
                />
                <Select
                    value={params.status || 'all'}
                    onValueChange={(value) => setFilter('status', value)}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder={t('ui.status_all')} />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={params.group || 'all'}
                    onValueChange={(value) => setFilter('group', value)}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder={t('ui.filter_all_groups')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('ui.filter_all_groups')}</SelectItem>
                        {Object.entries(groups as Record<string, { label?: string }>).map(([groupKey, groupItem]) => (
                            <SelectItem key={groupKey} value={groupKey}>
                                {groupItem?.label || groupKey}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={params.sort || 'name_asc'}
                    onValueChange={(value) => setFilter('sort', value)}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
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
