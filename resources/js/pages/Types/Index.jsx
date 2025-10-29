import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { useIndexPageFilters } from "@/hooks/useIndexPageFilters";
import { typeColumns } from "@/constants/tableColumns.jsx";
import IndexPageLayout from "@/components/IndexPageLayout";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import DataTable from "@/components/DataTable";
import MobileCardList from "@/components/MobileCardList";
import TypeMobileCard from "./Partials/TypeMobileCard";
import Pagination from "@/components/Pagination";
import TypeFilterCard from "./Partials/TypeFilterCard";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreVertical } from "lucide-react";

export default function Index({ auth, types, filters = {}, groups = {} }) {
    const { params, setFilter } = useIndexPageFilters("types.index", filters);
    const [confirmingTypeDeletion, setConfirmingTypeDeletion] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const deleteType = () => {
        setIsProcessing(true);
        router.delete(route("types.destroy", confirmingTypeDeletion), {
            preserveScroll: true,
            onSuccess: () => setConfirmingTypeDeletion(null),
            onFinish: () => setIsProcessing(false),
        });
    };

    const typeToDelete = types.data.find(
        (t) => t.id === confirmingTypeDeletion,
    );

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
                <TypeFilterCard
                    params={params}
                    setFilter={setFilter}
                    groups={groups}
                />

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
                isDeleting={isProcessing}
                title={`Hapus Tipe ${typeToDelete?.name}?`}
                confirmText="Hapus Tipe"
                description="Tindakan ini tidak dapat dibatalkan. Menghapus tipe dapat mempengaruhi data lain."
            />
        </IndexPageLayout>
    );
}
