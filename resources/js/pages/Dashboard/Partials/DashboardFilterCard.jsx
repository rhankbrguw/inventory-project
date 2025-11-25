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

export default function DashboardFilterCard({ auth, locations, filters }) {
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

            <div className="flex flex-col sm:flex-row gap-3">
                <SmartDateFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                <div className="relative">
                    <Select
                        value={filters.location_id || "all"}
                        onValueChange={(val) =>
                            handleFilterChange({ location_id: val })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs px-3">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Semua Lokasi" />
                        </SelectTrigger>
                        <SelectContent>
                            {auth.user.level === 1 && (
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
