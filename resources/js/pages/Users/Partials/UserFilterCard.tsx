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

export default function UserFilterCard({ params, setFilter, roles, locations }) {
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
                    placeholder={t('ui.search_name_email')}
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
                    value={params.role || 'all'}
                    onValueChange={(value) => setFilter('role', value)}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder={t('ui.filter_all_roles')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('ui.filter_all_roles')}</SelectItem>
                        {roles.map((r) => (
                            <SelectItem key={r.name} value={r.name}>
                                {r.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={params.location_id || 'all'}
                    onValueChange={(value) => setFilter('location_id', value)}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder={t('ui.filter_all_locations')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('ui.filter_all_locations')}</SelectItem>
                        <SelectItem value="global">{t('ui.global_access')}</SelectItem>
                        <SelectItem value="unassigned">{t('ui.no_locations_assigned')}</SelectItem>
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={String(loc.id)}>
                                {loc.name}
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
