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

export default function ProductFilterCard({
    params,
    setFilter,
    productTypes,
    allProducts: _allProducts,
    ...rest
}: {
    params: any;
    setFilter: any;
    productTypes: any;
    allProducts?: any;
    [key: string]: unknown;
}) {
    const { t } = useTranslation();

    const sortOptions = [
        { value: 'newest', label: t('ui.sort_newest') },
        { value: 'oldest', label: t('ui.sort_oldest') },
        { value: 'price_desc', label: t('ui.sort_price_desc') },
        { value: 'price_asc', label: t('ui.sort_price_asc') },
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
                    placeholder={t('ui.search_name_sku')}
                    value={params.search || ''}
                    onChange={(e) => setFilter('search', e.target.value)}
                    className="w-full md:w-auto md:flex-grow"
                />
                <Select
                    value={params.type_id || 'all'}
                    onValueChange={(value) => setFilter('type_id', value)}
                >
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder={t('ui.filter_all_types')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('ui.filter_all_types')}</SelectItem>
                        {productTypes.data.map((type) => (
                            <SelectItem
                                key={type.id}
                                value={type.id.toString()}
                            >
                                {type.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={params.status || 'all'}
                    onValueChange={(value) => setFilter('status', value)}
                >
                    <SelectTrigger className="w-full md:w-[180px]">
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
                    value={params.sort || 'newest'}
                    onValueChange={(value) => setFilter('sort', value)}
                >
                    <SelectTrigger className="w-full md:w-[180px]">
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
