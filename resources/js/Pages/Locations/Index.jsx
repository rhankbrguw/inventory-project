import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DataTable from "@/Components/DataTable";
import MobileCardList from "@/Components/MobileCardList";
import LocationMobileCard from "./Partials/LocationMobileCard";
import { locationColumns } from "@/Constants/tableColumns";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { Card, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Edit, MoreVertical, Archive, ArchiveRestore } from "lucide-react";

export default function Index({
    auth,
    locations: locationsResource,
    locationTypes,
    filters,
}) {
    const { data: locations } = locationsResource;
    const { params, setFilter } = useIndexPageFilters(
        "locations.index",
        filters
    );

    const handleDeactivate = (url) => {
        router.delete(url, { preserveScroll: true });
    };

    const handleActivate = (url) => {
        router.post(url, {}, { preserveScroll: true });
    };

    const renderActionDropdown = (location) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => router.get(location.urls.edit)}
                >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                {location.deleted_at ? (
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={() => handleActivate(location.urls.restore)}
                    >
                        <ArchiveRestore className="w-4 h-4 mr-2" /> Aktifkan
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onSelect={() => handleDeactivate(location.urls.destroy)}
                    >
                        <Archive className="w-4 h-4 mr-2" /> Nonaktifkan
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Lokasi"
            createRoute="locations.create"
            buttonLabel="Tambah Lokasi"
        >
            <Card className="mb-4">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            type="search"
                            placeholder="Cari nama lokasi atau pengguna..."
                            value={params.search || ""}
                            onChange={(e) =>
                                setFilter("search", e.target.value)
                            }
                            className="w-full sm:flex-grow"
                        />
                        <Select
                            value={params.type_id || "all"}
                            onValueChange={(value) =>
                                setFilter("type_id", value)
                            }
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Semua Tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                {locationTypes.map((type) => (
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
                            value={params.status || "all"}
                            onValueChange={(value) =>
                                setFilter("status", value)
                            }
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">
                                    Nonaktif
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <MobileCardList
                data={locations}
                renderItem={(location) => (
                    <div
                        onClick={() => router.get(location.urls.edit)}
                        key={location.id}
                        className="cursor-pointer"
                    >
                        <LocationMobileCard
                            location={location}
                            renderActionDropdown={renderActionDropdown}
                        />
                    </div>
                )}
            />

            <div className="hidden md:block">
                <DataTable
                    columns={locationColumns}
                    data={locations}
                    actions={renderActionDropdown}
                    showRoute={"locations.edit"}
                    rowClassName={(row) => (row.deleted_at ? "opacity-50" : "")}
                />
            </div>
        </IndexPageLayout>
    );
}
