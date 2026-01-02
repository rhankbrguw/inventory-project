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
import PrintButton from "@/components/PrintButton";
import { usePermission } from "@/hooks/usePermission";

export default function ReportFilterCard({ locations, products, filters }) {
    const { isSuperAdmin } = usePermission();

    const handleFilterChange = (newFilters) => {
        router.get(
            route("reports.index"),
            { ...filters, ...newFilters },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const getLocationValue = () => {
        if (isSuperAdmin) {
            return filters.location_id || "all";
        }
        return filters.location_id || locations[0]?.id?.toString() || "all";
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
            <div className="w-full sm:w-[180px]">
                <SmartDateFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />
            </div>

            <div className="w-full sm:w-[180px]">
                <Select
                    value={getLocationValue()}
                    onValueChange={(val) =>
                        handleFilterChange({ location_id: val })
                    }
                >
                    <SelectTrigger className="h-9 px-3 text-xs w-full">
                        <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <SelectValue placeholder="Pilih Lokasi" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {isSuperAdmin && (
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
                <div className="w-full sm:w-[180px]">
                    <Select
                        value={filters.product_id || "all"}
                        onValueChange={(val) =>
                            handleFilterChange({ product_id: val })
                        }
                    >
                        <SelectTrigger className="h-9 px-3 text-xs w-full">
                            <div className="flex items-center gap-2 min-w-0">
                                <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <SelectValue placeholder="Semua Produk" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Produk</SelectItem>
                            {products.map((prod) => (
                                <SelectItem
                                    key={prod.id}
                                    value={prod.id.toString()}
                                >
                                    {prod.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <PrintButton className="h-9 px-3 text-xs sm:w-auto w-full">
                Cetak
            </PrintButton>
        </div>
    );
}
