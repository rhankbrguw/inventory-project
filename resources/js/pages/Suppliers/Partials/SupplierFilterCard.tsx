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

export default function SupplierFilterCard({ params, setFilter }) {
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
            <CardContent className="grid gap-2 pt-6 md:flex md:flex-row md:items-center">
                <Input
                    type="search"
                    placeholder={t('ui.search_name_coord_email')}
                    value={params.search || ''}
                    onChange={(e) => setFilter('search', e.target.value)}
                    className="w-full md:w-auto md:flex-grow"
                />
                <Select
                    value={params.status || 'all'}
                    onValueChange={(value) => setFilter('status', value)}
                >
                    <SelectTrigger className="w-full md:w-[200px]">
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
                    value={params.sort || 'name_asc'}
                    onValueChange={(value) => setFilter('sort', value)}
                >
                    <SelectTrigger className="w-full md:w-[200px]">
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
