import React from "react";
import { router } from "@inertiajs/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MapPin, Package } from "lucide-react";
import SmartDateFilter from "@/components/SmartDateFilter";

export default function ReportFilterCard({ auth, locations, products, filters }) {
    const handleFilterChange = (newFilters) => {
        router.get(
            route("reports.index"),
            { ...filters, ...newFilters },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    return (
        <div className="flex flex-col md:flex-row gap-3 w-full">
            <div className="w-full md:w-auto">
                <SmartDateFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />
            </div>

            <div className="w-full md:w-[200px]">
                <Select
                    value={filters.location_id || "all"}
                    onValueChange={(val) => handleFilterChange({ location_id: val })}
                >
                    <SelectTrigger className="h-9 px-3 text-xs">
                        <div className="flex items-center min-w-0">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <SelectValue placeholder="Semua Lokasi" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {auth.user.level === 1 && (
                            <SelectItem value="all">Semua Lokasi</SelectItem>
                        )}
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                                {loc.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {products && products.length > 0 && (
                <div className="w-full md:w-[200px]">
                    <Select
                        value={filters.product_id || "all"}
                        onValueChange={(val) => handleFilterChange({ product_id: val })}
                    >
                        <SelectTrigger className="h-9 px-3 text-xs">
                            <div className="flex items-center min-w-0">
                                <Package className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <SelectValue placeholder="Semua Produk" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Produk</SelectItem>
                            {products.map((prod) => (
                                <SelectItem key={prod.id} value={prod.id.toString()}>
                                    {prod.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}
