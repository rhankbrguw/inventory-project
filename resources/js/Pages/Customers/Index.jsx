import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { customerColumns } from "@/Constants/tableColumns.jsx";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DeleteConfirmationDialog from "@/Components/DeleteConfirmationDialog";
import DataTable from "@/Components/DataTable";
import MobileCardList from "@/Components/MobileCardList";
import CustomerMobileCard from "./Partials/CustomerMobileCard";
import Pagination from "@/Components/Pagination";
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
    { value: "newest", label: "Pelanggan Terbaru" },
    { value: "oldest", label: "Pelanggan Terlama" },
    { value: "name_asc", label: "Nama (A-Z)" },
    { value: "name_desc", label: "Nama (Z-A)" },
];

export default function Index({ auth, customers, filters = {} }) {
    const { params, setFilter } = useIndexPageFilters(
        "customers.index",
        filters
    );
    const [confirmingDeletion, setConfirmingDeletion] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteCustomer = () => {
        setIsDeleting(true);
        router.delete(route("customers.destroy", confirmingDeletion), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmingDeletion(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    const renderActionDropdown = (customer) => (
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
                <Link href={route("customers.edit", customer.id)}>
                    <DropdownMenuItem className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => setConfirmingDeletion(customer.id)}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Pelanggan"
            createRoute="customers.create"
            buttonLabel="Tambah Pelanggan"
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-6">
                        <Input
                            type="search"
                            placeholder="Cari nama, email, atau telepon..."
                            value={params.search || ""}
                            onChange={(e) =>
                                setFilter("search", e.target.value)
                            }
                            className="w-full sm:w-auto sm:flex-grow"
                        />
                        <Select
                            value={params.sort || "newest"}
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
                    data={customers.data}
                    renderItem={(customer) => (
                        <Link
                            href={route("customers.edit", customer.id)}
                            key={customer.id}
                        >
                            <CustomerMobileCard
                                customer={customer}
                                renderActionDropdown={renderActionDropdown}
                            />
                        </Link>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={customerColumns}
                        data={customers.data}
                        actions={renderActionDropdown}
                        showRoute={"customers.edit"}
                    />
                </div>

                {customers.data.length > 0 && (
                    <Pagination links={customers.meta.links} />
                )}
            </div>

            <DeleteConfirmationDialog
                open={confirmingDeletion !== null}
                onOpenChange={() => setConfirmingDeletion(null)}
                onConfirm={deleteCustomer}
                isDeleting={isDeleting}
                confirmText="Hapus Pelanggan"
                description="Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data pelanggan secara permanen."
            />
        </IndexPageLayout>
    );
}
