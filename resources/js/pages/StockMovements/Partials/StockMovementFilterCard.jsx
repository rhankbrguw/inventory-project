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

export default function StockMovementFilterCard({
    params,
    setFilter,
    products,
    locations,
    movementTypes,
}) {
    return (
        <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-2 pt-6">
                <Input
                    type="search"
                    placeholder="Cari nama atau SKU..."
                    value={params.search || ""}
                    onChange={(e) => setFilter("search", e.target.value)}
                    className="w-full sm:w-auto sm:flex-grow"
                />
                <div className="relative w-full sm:w-[200px]">
                    <ProductCombobox
                        products={products.data}
                        value={params.product_id}
                        onChange={(product) =>
                            setFilter("product_id", product?.id)
                        }
                        placeholder="Semua Produk"
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
                    value={params.type || "all"}
                    onValueChange={(value) => setFilter("type", value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Semua Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        {movementTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
}
