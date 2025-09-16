import { Link, router } from "@inertiajs/react";
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

const TABLE_COLUMNS = [
    { key: "group", label: "Grup", align: "center", className: "font-medium" },
    { key: "name", label: "Nama", align: "center" },
    { key: "code", label: "Kode", align: "center" },
    { key: "actions", label: "Aksi", align: "center" },
];

const getAlignmentClass = (align) => {
    const alignmentMap = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    };
    return alignmentMap[align] || "text-left";
};

export default function Index({ auth, types }) {
    const [confirmingTypeDeletion, setConfirmingTypeDeletion] = useState(null);

    const deleteType = () => {
        router.delete(route("types.destroy", confirmingTypeDeletion), {
            preserveScroll: true,
            onSuccess: () => setConfirmingTypeDeletion(null),
        });
    };

    const formatGroupName = (groupName) => {
        return groupName
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const renderActionDropdown = (type) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <Link href={route("types.edit", type.id)}>
                    <DropdownMenuItem className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => setConfirmingTypeDeletion(type.id)}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const renderCellContent = (column, type) => {
        switch (column.key) {
            case "group":
                return formatGroupName(type.group);
            case "name":
                return type.name;
            case "code":
                return type.code || "-";
            case "actions":
                return renderActionDropdown(type);
            default:
                return "";
        }
    };

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Tipe"
            createRoute="types.create"
            buttonLabel="Tambah Tipe Baru"
        >
            <div className="space-y-4">
                <div className="md:hidden space-y-4">
                    {types.map((type) => (
                        <Card key={type.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {type.name}
                                </CardTitle>
                                {renderActionDropdown(type)}
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {formatGroupName(type.group)}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                        {type.code || "NO CODE"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="hidden md:block bg-card text-card-foreground shadow-sm sm:rounded-lg overflow-x-auto">
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
                            {types.map((type) => (
                                <TableRow key={type.id}>
                                    {TABLE_COLUMNS.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            className={`${getAlignmentClass(
                                                column.align
                                            )} ${column.className || ""}`}
                                        >
                                            {renderCellContent(column, type)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AlertDialog
                open={confirmingTypeDeletion !== null}
                onOpenChange={() => setConfirmingTypeDeletion(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Menghapus tipe
                            dapat mempengaruhi data lain yang terkait.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteType}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Hapus Tipe
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </IndexPageLayout>
    );
}
