import { Link, router } from "@inertiajs/react";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DataTable from "@/Components/DataTable";
import MobileCardList from "@/Components/MobileCardList";
import LocationMobileCard from "./Partials/LocationMobileCard";
import { locationColumns } from "@/Constants/tableColumns";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { useSoftDeletes } from "@/Hooks/useSoftDeletes";
import Pagination from "@/Components/Pagination";
import DeleteConfirmationDialog from "@/Components/DeleteConfirmationDialog";
import LocationFilterCard from "./Partials/LocationFilterCard";
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
    const { params, setFilter } = useIndexPageFilters(
        "locations.index",
        filters
    );
    const canCrudLocations = auth.user.roles.includes("Super Admin");

    const {
        confirmingDeletion,
        setConfirmingDeletion,
        isProcessing,
        itemToDeactivate,
        deactivateItem,
        restoreItem,
    } = useSoftDeletes({
        resourceName: "locations",
        data: locationsResource.data,
    });

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
                        className="cursor-pointer text-emerald-600 focus:text-emerald-700"
                        onSelect={() => restoreItem(location.id)}
                    >
                        <ArchiveRestore className="w-4 h-4 mr-2" /> Aktifkan
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onSelect={() => setConfirmingDeletion(location.id)}
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
                <LocationFilterCard
                    params={params}
                    setFilter={setFilter}
                    locationTypes={locationTypes}
                />

                <MobileCardList
                    data={locationsResource.data}
                    renderItem={(location) => (
                        <Link
                            href={
                                canCrudLocations
                                    ? route("locations.edit", location.id)
                                    : "#"
                            }
                            key={location.id}
                            className={
                                !canCrudLocations ? "pointer-events-none" : ""
                            }
                        >
                            <LocationMobileCard
                                location={location}
                                renderActionDropdown={
                                    canCrudLocations
                                        ? renderActionDropdown
                                        : null
                                }
                            />
                        </Link>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={locationColumns}
                        data={locationsResource.data}
                        actions={canCrudLocations ? renderActionDropdown : null}
                        showRoute={canCrudLocations ? "locations.edit" : null}
                        rowClassName={(row) =>
                            row.deleted_at ? "opacity-50" : ""
                        }
                    />
                </div>

                {locationsResource.data.length > 0 && (
                    <Pagination links={locationsResource.meta.links} />
                )}
            </div>

            {canCrudLocations && (
                <DeleteConfirmationDialog
                    open={confirmingDeletion !== null}
                    onOpenChange={() => setConfirmingDeletion(null)}
                    onConfirm={deactivateItem}
                    isDeleting={isProcessing}
                    confirmText="Nonaktifkan"
                    title={`Nonaktifkan ${itemToDeactivate?.name}?`}
                    description="Tindakan ini akan menyembunyikan lokasi dari daftar. Anda bisa mengaktifkannya kembali nanti."
                />
            )}
        </IndexPageLayout>
    );
}
