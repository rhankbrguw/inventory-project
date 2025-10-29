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
    { value: "newest", label: "Produk Terbaru" },
    { value: "oldest", label: "Produk Terlama" },
    { value: "price_desc", label: "Harga Tertinggi" },
    { value: "price_asc", label: "Harga Terendah" },
];

const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Nonaktif" },
];

export default function ProductFilterCard({ params, setFilter, allProducts }) {
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
                        products={allProducts}
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
                    value={params.status || "all"}
                    onValueChange={(value) => setFilter("status", value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
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
                    value={params.sort || "newest"}
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
