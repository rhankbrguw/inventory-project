import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DeleteConfirmationDialog from "@/Components/DeleteConfirmationDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import Pagination from "@/Components/Pagination";

const TABLE_COLUMNS = [
    {
        key: "name",
        label: "Nama",
        align: "center",
        className: "font-medium",
    },
    {
        key: "email",
        label: "Email",
        align: "center",
        className: "text-muted-foreground",
    },
    {
        key: "role_code",
        label: "Kode",
        align: "center",
        className: "font-mono text-xs",
    },
    {
        key: "role_badge",
        label: "Jabatan",
        align: "center",
    },
    {
        key: "actions",
        label: "Aksi",
        align: "center",
    },
];

const getAlignmentClass = (align) => {
    const alignmentMap = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    };
    return alignmentMap[align] || "text-left";
};

const RoleBadge = ({ role }) => {
    if (!role) {
        return <span>-</span>;
    }

    const getRoleClass = (roleName) => {
        const roleClassMap = {
            "Super Admin": "role-super-admin",
            "Warehouse Manager": "role-warehouse-manager",
            "Branch Manager": "role-branch-manager",
            Cashier: "role-cashier",
        };

        return roleClassMap[roleName] || "role-default";
    };
    return (
        <span
            className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${getRoleClass(
                role.name
            )}`}
        >
            {role.name}
        </span>
    );
};

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
                <Button variant="ghost" size="icon">
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

    const renderCellContent = (column, user) => {
        switch (column.key) {
            case "name":
                return user.name;
            case "email":
                return user.email;
            case "role_code":
                return user.role ? user.role.code : "-";
            case "role_badge":
                return <RoleBadge role={user.role} />;
            case "actions":
                return renderActionDropdown(user);
            default:
                return "";
        }
    };

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

                <div className="md:hidden space-y-4">
                    {users.data.map((user) => (
                        <Card key={user.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {user.name}
                                </CardTitle>
                                {renderActionDropdown(user)}
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {user.email}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                        {user.role ? user.role.code : "-"}
                                    </span>
                                    <RoleBadge role={user.role} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="hidden md:block bg-card text-card-foreground overflow-hidden shadow-sm sm:rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {TABLE_COLUMNS.map((column) => (
                                    <TableHead
                                        key={column.key}
                                        className={getAlignmentClass(
                                            column.align
                                        )}
                                    >
                                        {column.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.map((user) => (
                                <TableRow key={user.id}>
                                    {TABLE_COLUMNS.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            className={`${getAlignmentClass(
                                                column.align
                                            )} ${column.className || ""}`}
                                        >
                                            {renderCellContent(column, user)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
