import { Link, router, usePage } from '@inertiajs/react';
import IndexPageLayout from '@/components/IndexPageLayout';
import DataTable from '@/components/DataTable';
import MobileCardList from '@/components/MobileCardList';
import CustomerMobileCard from './Partials/CustomerMobileCard';
import { customerColumns } from '@/constants/tableColumns';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { useSoftDeletes } from '@/hooks/useSoftDeletes';
import Pagination from '@/components/Pagination';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import CustomerFilterCard from './Partials/CustomerFilterCard';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Archive, ArchiveRestore, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';

export default function Index({ auth, customers, customerTypes, filters }) {
    const { can } = usePage().props.auth;
    const { isManager } = usePermission();

    const canEditCustomer = can.create_customer;
    const canDeleteCustomer = isManager;

    const { params, setFilter } = useIndexPageFilters('customers.index', filters);

    const {
        confirmingDeletion,
        setConfirmingDeletion,
        isProcessing,
        itemToDeactivate,
        deactivateItem,
        restoreItem,
    } = useSoftDeletes({ resourceName: 'customers', data: customers.data });

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
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => router.get(route('customers.edit', customer.id))}
                >
                    {canEditCustomer ? (
                        <>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </>
                    ) : (
                        <>
                            <Eye className="w-4 h-4 mr-2" /> Lihat
                        </>
                    )}
                </DropdownMenuItem>

                {canDeleteCustomer && (
                    <>
                        {customer.deleted_at ? (
                            <DropdownMenuItem
                                className="cursor-pointer text-success focus:text-success"
                                onSelect={() => restoreItem(customer.id)}
                            >
                                <ArchiveRestore className="w-4 h-4 mr-2" /> Aktifkan
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onSelect={() => setConfirmingDeletion(customer.id)}
                            >
                                <Archive className="w-4 h-4 mr-2" /> Nonaktifkan
                            </DropdownMenuItem>
                        )}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Pelanggan"
            createRoute={can.create_customer ? 'customers.create' : null}
            buttonLabel="Tambah Pelanggan"
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
                            href={
                                canEditCustomer
                                    ? route('customers.edit', customer.id)
                                    : '#'
                            }
                            key={customer.id}
                            className={cn(
                                'block',
                                !canEditCustomer && 'pointer-events-none',
                                customer.deleted_at && 'opacity-50'
                            )}
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
                        showRoute={canEditCustomer ? 'customers.edit' : null}
                        rowClassName={(row) => (row.deleted_at ? 'opacity-50' : '')}
                    />
                </div>

                {customers.data.length > 0 && <Pagination links={customers.meta.links} />}
            </div>

            {canDeleteCustomer && (
                <DeleteConfirmationDialog
                    open={confirmingDeletion !== null}
                    onOpenChange={() => setConfirmingDeletion(null)}
                    onConfirm={deactivateItem}
                    isDeleting={isProcessing}
                    confirmText="Nonaktifkan"
                    title={`Nonaktifkan ${itemToDeactivate?.name}?`}
                    description="Tindakan ini akan menyembunyikan pelanggan dari daftar."
                />
            )}
        </IndexPageLayout>
    );
}
