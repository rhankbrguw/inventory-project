import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const sortOptions = [
    { value: "newest", label: "Pelanggan Terbaru" },
    { value: "oldest", label: "Pelanggan Terlama" },
    { value: "name_asc", label: "Nama (A-Z)" },
    { value: "name_desc", label: "Nama (Z-A)" },
];

export default function CustomerFilterCard({
    params,
    setFilter,
    customerTypes,
}) {
    return (
        <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-2 pt-6">
                <Input
                    type="search"
                    placeholder="Cari nama, email, atau telepon..."
                    value={params.search || ""}
                    onChange={(e) => setFilter("search", e.target.value)}
                    className="w-full sm:w-auto sm:flex-grow"
                />
                <Select
                    value={params.type_id || "all"}
                    onValueChange={(value) => setFilter("type_id", value)}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Semua Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        {customerTypes.data.map((type) => (
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
                    value={params.sort || "newest"}
                    onValueChange={(value) => setFilter("sort", value)}
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
