import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const sortOptions = [
    { value: 'name_asc', label: 'Nama (A-Z)' },
    { value: 'name_desc', label: 'Nama (Z-A)' },
];

export default function TypeFilterCard({ params, setFilter, groups }) {
    return (
        <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-2 pt-6">
                <Input
                    type="search"
                    placeholder="Cari nama atau kode..."
                    value={params.search || ''}
                    onChange={(e) => setFilter('search', e.target.value)}
                    className="w-full sm:w-auto sm:flex-grow"
                />
                <Select
                    value={params.group || 'all'}
                    onValueChange={(value) => setFilter('group', value)}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Semua Grup" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Grup</SelectItem>
                        {Object.entries(groups).map(([value, { label }]) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={params.sort || 'name_asc'}
                    onValueChange={(value) => setFilter('sort', value)}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Urutkan" />
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
