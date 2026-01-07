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
const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Nonaktif' },
];
export default function UserFilterCard({ params, setFilter, roles }) {
    return (
        <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-2 pt-6">
                <Input
                    type="search"
                    placeholder="Cari nama atau email..."
                    value={params.search || ''}
                    onChange={(e) => setFilter('search', e.target.value)}
                    className="w-full sm:w-auto sm:flex-grow"
                />
                <Select
                    value={params.status || 'all'}
                    onValueChange={(value) => setFilter('status', value)}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Semua Status" />
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
                        <SelectValue placeholder="Semua Jabatan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Jabatan</SelectItem>
                        {roles.map((r) => (
                            <SelectItem key={r.name} value={r.name}>
                                {r.name}
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
