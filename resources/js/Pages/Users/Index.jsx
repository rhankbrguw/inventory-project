import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import IndexPageLayout from "@/Components/IndexPageLayout";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import Pagination from "@/Components/Pagination";

const RoleBadge = ({ role }) => {
    if (!role) {
        return <span>-</span>;
    }
    const roleColors = {
        "Super Admin": "bg-primary text-primary-foreground",
        "Warehouse Manager": "bg-amber-500 text-white",
        "Branch Manager": "bg-blue-500 text-white",
        Cashier: "bg-gray-500 text-white",
    };
    return (
        <span
            className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${
                roleColors[role.name] || "bg-muted text-muted-foreground"
            }`}
        >
            {role.name}
        </span>
    );
};

export default function Index({ auth, users }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(null);

    const deleteUser = () => {
        router.delete(route("users.destroy", confirmingUserDeletion), {
            preserveScroll: true,
            onSuccess: () => setConfirmingUserDeletion(null),
        });
    };

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Pengguna"
            createRoute="users.create"
            buttonLabel="Tambah Pengguna"
        >
            <div className="space-y-4">
                <div className="md:hidden space-y-4">
                    {users.data.map((user) => (
                        <Card key={user.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {user.name}
                                </CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <Link
                                            href={route("users.edit", user.id)}
                                        >
                                            <DropdownMenuItem className="cursor-pointer">
                                                <Edit className="w-4 h-4 mr-2" />{" "}
                                                Edit
                                            </DropdownMenuItem>
                                        </Link>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive cursor-pointer"
                                            onClick={() =>
                                                setConfirmingUserDeletion(
                                                    user.id
                                                )
                                            }
                                            disabled={user.id === auth.user.id}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />{" "}
                                            Hapus
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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

                <div className="hidden md:block bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">
                                    Nama
                                </TableHead>
                                <TableHead className="text-center">
                                    Email
                                </TableHead>
                                <TableHead className="text-center">
                                    Kode
                                </TableHead>
                                <TableHead className="text-center">
                                    Jabatan
                                </TableHead>
                                <TableHead className="text-center">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="text-center">
                                        {user.name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {user.email}
                                    </TableCell>
                                    <TableCell className="text-center font-mono">
                                        {user.role ? user.role.code : "-"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <RoleBadge role={user.role} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link
                                                    href={route(
                                                        "users.edit",
                                                        user.id
                                                    )}
                                                >
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Edit className="w-4 h-4 mr-2" />{" "}
                                                        Edit
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive cursor-pointer"
                                                    onClick={() =>
                                                        setConfirmingUserDeletion(
                                                            user.id
                                                        )
                                                    }
                                                    disabled={
                                                        user.id === auth.user.id
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />{" "}
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Pagination links={users.meta.links} />
            </div>

            <AlertDialog
                open={confirmingUserDeletion !== null}
                onOpenChange={() => setConfirmingUserDeletion(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan
                            menghapus akun pengguna secara permanen dari sistem.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteUser}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Hapus Pengguna
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </IndexPageLayout>
    );
}
