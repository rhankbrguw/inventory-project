import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { useIndexPageFilters } from "@/hooks/useIndexPageFilters";
import { customerColumns } from "@/constants/tableColumns.jsx";
import IndexPageLayout from "@/components/IndexPageLayout";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import DataTable from "@/components/DataTable";
import MobileCardList from "@/components/MobileCardList";
import CustomerMobileCard from "./Partials/CustomerMobileCard";
import Pagination from "@/components/Pagination";
import QuickAddTypeModal from "@/components/QuickAddTypeModal";
import CustomerFilterCard from "./Partials/CustomerFilterCard";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreVertical, PlusCircle } from "lucide-react";

export default function Index({
    auth,
    customers,
    filters = {},
    customerTypes = { data: [] },
}) {
    const { params, setFilter } = useIndexPageFilters(
        "customers.index",
        filters,
    );
    const [confirmingDeletion, setConfirmingDeletion] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const deleteCustomer = () => {
        setIsProcessing(true);

        router.delete(route("customers.destroy", confirmingDeletion), {
            preserveScroll: true,
            onSuccess: () => setConfirmingDeletion(null),
            onFinish: () => setIsProcessing(false),
        });
    };

    const customerToDelete = customers.data.find(
        (c) => c.id === confirmingDeletion,
    );

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
            headerActions={
                <QuickAddTypeModal
                    group="customer_type"
                    title="Tambah Tipe Pelanggan Cepat"
                    description="Tipe yang baru dibuat akan langsung tersedia di dropdown pada form."
                    existingTypes={customerTypes.data}
                    trigger={
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 px-2 sm:px-4"
                        >
                            <PlusCircle className="w-5 h-5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">
                                Tambah Tipe
                            </span>
                        </Button>
                    }
                />
            }
        >
            <div className="space-y-4">
                <CustomerFilterCard
                    params={params}
                    setFilter={setFilter}
                    customerTypes={customerTypes}
                />

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
                isDeleting={isProcessing}
                title={`Hapus Pelanggan ${customerToDelete?.name}?`}
                confirmText="Hapus Pelanggan"
                description="Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data pelanggan secara permanen."
            />
        </IndexPageLayout>
    );
}
