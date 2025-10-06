import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { typeColumns } from "@/Constants/tableColumns.jsx";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DeleteConfirmationDialog from "@/Components/DeleteConfirmationDialog";
import DataTable from "@/Components/DataTable";
import MobileCardList from "@/Components/MobileCardList";
import TypeMobileCard from "./Partials/TypeMobileCard";
import Pagination from "@/Components/Pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Edit, Trash2, MoreVertical } from "lucide-react";

const sortOptions = [
    { value: "name_asc", label: "Nama (A-Z)" },
    { value: "name_desc", label: "Nama (Z-A)" },
];

export default function Index({ auth, types, filters = {}, groups = {} }) {
    const { params, setFilter } = useIndexPageFilters("types.index", filters);
    const [confirmingTypeDeletion, setConfirmingTypeDeletion] = useState(null);

    const deleteType = () => {
        router.delete(route("types.destroy", confirmingTypeDeletion), {
            preserveScroll: true,
            onSuccess: () => setConfirmingTypeDeletion(null),
        });
    };

    const renderActionDropdown = (type) => (
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
                    onSelect={() => router.get(route("types.edit", type.id))}
                >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setConfirmingTypeDeletion(type.id)}
                    className="text-destructive focus:text-destructive cursor-pointer"
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Tipe"
            createRoute="types.create"
            buttonLabel="Tambah Tipe Baru"
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-6">
                        <Input
                            type="search"
                            placeholder="Cari nama atau kode..."
                            value={params.search || ""}
                            onChange={(e) =>
                                setFilter("search", e.target.value)
                            }
                            className="w-full sm:w-auto sm:flex-grow"
                        />
                        <Select
                            value={params.group || "all"}
                            onValueChange={(value) => setFilter("group", value)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Semua Grup" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Grup</SelectItem>
                                {Object.entries(groups).map(
                                    ([value, { label }]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                        <Select
                            value={params.sort || "name_asc"}
                            onValueChange={(value) => setFilter("sort", value)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Urutkan" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <MobileCardList
                    data={types.data}
                    renderItem={(type) => (
                        <Link href={route("types.edit", type.id)} key={type.id}>
                            <TypeMobileCard
                                type={type}
                                renderActionDropdown={renderActionDropdown}
                            />
                        </Link>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={typeColumns}
                        data={types.data}
                        actions={renderActionDropdown}
                        showRoute={"types.edit"}
                    />
                </div>

                {types.data.length > 0 && (
                    <Pagination links={types.meta.links} />
                )}
            </div>

            <DeleteConfirmationDialog
                open={confirmingTypeDeletion !== null}
                onOpenChange={() => setConfirmingTypeDeletion(null)}
                onConfirm={deleteType}
                confirmText="Hapus Tipe"
                description="Tindakan ini tidak dapat dibatalkan. Menghapus tipe dapat mempengaruhi data lain."
            />
        </IndexPageLayout>
    );
}
