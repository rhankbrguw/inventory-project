import React from "react";
import { router } from "@inertiajs/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import SmartDateFilter from "@/components/SmartDateFilter";
import { usePermission } from "@/hooks/usePermission";

export default function DashboardFilterCard({ locations, filters }) {
    const { isSuperAdmin } = usePermission();

    const handleFilterChange = (newFilters) => {
        router.get(
            route("dashboard"),
            { ...filters, ...newFilters },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                    Overview performa & stok{" "}
                    {filters.location_id ? "lokasi terpilih" : "global"}.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="w-full sm:w-[240px] md:w-[280px]">
                    <SmartDateFilter
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>
                <div className="w-full sm:w-[240px] md:w-[280px]">
                    <Select
                        value={filters.location_id || "all"}
                        onValueChange={(val) =>
                            handleFilterChange({ location_id: val })
                        }
                    >
                        <SelectTrigger className="h-10 px-3 text-sm w-full">
                            <div className="flex items-center gap-2 min-w-0">
                                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <SelectValue placeholder="Semua Lokasi" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {isSuperAdmin && (
                                <SelectItem value="all">
                                    Semua Lokasi
                                </SelectItem>
                            )}
                            {locations.map((loc) => (
                                <SelectItem
                                    key={loc.id}
                                    value={loc.id.toString()}
                                >
                                    {loc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
