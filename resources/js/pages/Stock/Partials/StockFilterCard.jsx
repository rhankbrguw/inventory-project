import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ProductCombobox from "@/components/ProductCombobox";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const sortOptions = [
    { value: "name_asc", label: "Nama (A-Z)" },
    { value: "name_desc", label: "Nama (Z-A)" },
    { value: "quantity_desc", label: "Stok Terbanyak" },
    { value: "quantity_asc", label: "Stok Terdikit" },
    { value: "last_moved_desc", label: "Aktivitas Terbaru" },
    { value: "last_moved_asc", label: "Aktivitas Terlama" },
];

export default function StockFilterCard({
    params,
    setFilter,
    products,
    locations,
}) {
    return (
        <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-2 pt-6">
                <Input
                    type="search"
                    placeholder="Cari nama atau sku..."
                    value={params.search || ""}
                    onChange={(e) => setFilter("search", e.target.value)}
                    className="w-full sm:w-auto sm:flex-grow"
                />
                <div className="relative w-full sm:w-[200px]">
                    <ProductCombobox
                        products={products}
                        value={params.product_id}
                        onChange={(product) =>
                            setFilter("product_id", product.id)
                        }
                    />
                    {params.product_id && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full"
                            onClick={() => setFilter("product_id", null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <Select
                    value={params.location_id || "all"}
                    onValueChange={(value) => setFilter("location_id", value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Semua Lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Lokasi</SelectItem>
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                                {loc.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={params.sort || "name_asc"}
                    onValueChange={(value) => setFilter("sort", value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
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
