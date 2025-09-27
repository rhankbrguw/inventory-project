import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { userColumns } from "@/Constants/tableColumns.jsx";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DeleteConfirmationDialog from "@/Components/DeleteConfirmationDialog";
import DataTable from "@/Components/DataTable";
import MobileCardList from "@/Components/MobileCardList";
import UserMobileCard from "./Partials/UserMobileCard";
import Pagination from "@/Components/Pagination";
import RoleBadge from "@/Components/RoleBadge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Edit, Trash2, MoreVertical } from "lucide-react";

const sortOptions = [
    { value: "name_asc", label: "Nama (A-Z)" },
    { value: "name_desc", label: "Nama (Z-A)" },
];

export default function Index({ auth, users, roles, filters = {} }) {
    const { params, setFilter } = useIndexPageFilters(
        "users.index",
        filters,
        "name_asc"
    );
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(null);

    const deleteUser = () => {
        router.delete(route("users.destroy", confirmingUserDeletion), {
            preserveScroll: true,
            onSuccess: () => setConfirmingUserDeletion(null),
        });
    };

    const renderActionDropdown = (user) => (
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
                <Link href={route("users.edit", user.id)}>
                    <DropdownMenuItem className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => setConfirmingUserDeletion(user.id)}
                    disabled={user.id === auth.user.id}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Pengguna"
            createRoute="users.create"
            buttonLabel="Tambah Pengguna"
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-6">
                        <Input
                            type="search"
                            placeholder="Cari nama atau email..."
                            value={params.search || ""}
                            onChange={(e) =>
                                setFilter("search", e.target.value)
                            }
                            className="w-full sm:w-auto sm:flex-grow"
                        />
                        <Select
                            value={params.role || "all"}
                            onValueChange={(value) => setFilter("role", value)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Semua Jabatan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Jabatan
                                </SelectItem>
                                {roles.map((r) => (
                                    <SelectItem key={r.name} value={r.name}>
                                        {r.name}
                                    </SelectItem>
                                ))}
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
                    data={users.data}
                    renderItem={(user) => (
                        <Link href={route("users.edit", user.id)} key={user.id}>
                            <UserMobileCard
                                user={user}
                                renderActionDropdown={renderActionDropdown}
                            />
                        </Link>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={userColumns}
                        data={users.data}
                        actions={renderActionDropdown}
                        showRoute={"users.edit"}
                    />
                </div>

                {users.data.length > 0 && (
                    <Pagination links={users.meta.links} />
                )}
            </div>

            <DeleteConfirmationDialog
                open={confirmingUserDeletion !== null}
                onOpenChange={() => setConfirmingUserDeletion(null)}
                onConfirm={deleteUser}
                confirmText="Hapus Pengguna"
                description="Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun pengguna secara permanen dari sistem."
            />
        </IndexPageLayout>
    );
}
