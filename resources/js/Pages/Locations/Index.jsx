import { router } from "@inertiajs/react";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DataTable from "@/Components/DataTable";
import MobileCardList from "@/Components/MobileCardList";
import LocationMobileCard from "./Partials/LocationMobileCard";
import { locationColumns } from "@/Constants/tableColumns";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import Pagination from "@/Components/Pagination";
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
    const { data, meta, links } = locationsResource;
    const { params, setFilter } = useIndexPageFilters(
        "locations.index",
        filters
    );
    const canCrudLocations = auth.user.roles.includes("Super Admin");

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
                    onSelect={() =>
                        router.get(route("locations.edit", location.id))
                    }
                >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                {location.deleted_at ? (
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={() =>
                            handleActivate(
                                route("locations.restore", location.id)
                            )
                        }
                    >
                        <ArchiveRestore className="w-4 h-4 mr-2" /> Aktifkan
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onSelect={() =>
                            handleDeactivate(
                                route("locations.destroy", location.id)
                            )
                        }
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
            createRoute={canCrudLocations ? "locations.create" : null}
            buttonLabel="Tambah Lokasi"
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
                            <Input
                                type="search"
                                placeholder="Cari nama lokasi atau pengguna..."
                                value={params.search || ""}
                                onChange={(e) =>
                                    setFilter("search", e.target.value)
                                }
                            />
                            <Select
                                value={params.type_id || "all"}
                                onValueChange={(value) =>
                                    setFilter("type_id", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Tipe
                                    </SelectItem>
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Aktif
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Nonaktif
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <MobileCardList
                    data={data}
                    renderItem={(location) => (
                        <div
                            onClick={() => {
                                if (canCrudLocations) {
                                    router.get(
                                        route("locations.edit", location.id)
                                    );
                                }
                            }}
                            key={location.id}
                            className={canCrudLocations ? "cursor-pointer" : ""}
                        >
                            <LocationMobileCard
                                location={location}
                                renderActionDropdown={
                                    canCrudLocations
                                        ? renderActionDropdown
                                        : null
                                }
                            />
                        </div>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={locationColumns}
                        data={data}
                        actions={canCrudLocations ? renderActionDropdown : null}
                        showRoute={canCrudLocations ? "locations.edit" : null}
                        rowClassName={(row) =>
                            row.deleted_at ? "opacity-50" : ""
                        }
                    />
                </div>

                {data.length > 0 && <Pagination links={meta.links} />}
            </div>
        </IndexPageLayout>
    );
}
