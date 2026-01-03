import { Link, router } from '@inertiajs/react';
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
    const { params, setFilter } = useIndexPageFilters(
        'customers.index',
        filters
    );

    const { isManager, isOperational } = usePermission();

    const canCrudCustomers = isManager;

    const canViewCustomers = isOperational;

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
                {canCrudCustomers ? (
                    <>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() =>
                                router.get(route('customers.edit', customer.id))
                            }
                        >
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        {customer.deleted_at ? (
                            <DropdownMenuItem
                                className="cursor-pointer text-success focus:text-success"
                                onSelect={() => restoreItem(customer.id)}
                            >
                                <ArchiveRestore className="w-4 h-4 mr-2" />{' '}
                                Aktifkan
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onSelect={() =>
                                    setConfirmingDeletion(customer.id)
                                }
                            >
                                <Archive className="w-4 h-4 mr-2" /> Nonaktifkan
                            </DropdownMenuItem>
                        )}
                    </>
                ) : (
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={() =>
                            router.get(route('customers.edit', customer.id))
                        }
                    >
                        <Eye className="w-4 h-4 mr-2" /> Lihat
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Pelanggan"
            createRoute={canCrudCustomers ? 'customers.create' : null}
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
                                canViewCustomers
                                    ? route('customers.edit', customer.id)
                                    : '#'
                            }
                            key={customer.id}
                            className={cn(
                                !canViewCustomers && 'pointer-events-none',
                                customer.deleted_at && 'opacity-50'
                            )}
                        >
                            <CustomerMobileCard
                                customer={customer}
                                renderActionDropdown={
                                    canViewCustomers
                                        ? renderActionDropdown
                                        : null
                                }
                            />
                        </Link>
                    )}
                />
                <div className="hidden md:block">
                    <DataTable
                        columns={customerColumns}
                        data={customers.data}
                        actions={canViewCustomers ? renderActionDropdown : null}
                        showRoute={canViewCustomers ? 'customers.edit' : null}
                        rowClassName={(row) =>
                            row.deleted_at ? 'opacity-50' : ''
                        }
                    />
                </div>
                {customers.data.length > 0 && (
                    <Pagination links={customers.meta.links} />
                )}
            </div>
            {canCrudCustomers && (
                <DeleteConfirmationDialog
                    open={confirmingDeletion !== null}
                    onOpenChange={() => setConfirmingDeletion(null)}
                    onConfirm={deactivateItem}
                    isDeleting={isProcessing}
                    confirmText="Nonaktifkan"
                    title={`Nonaktifkan ${itemToDeactivate?.name}?`}
                    description="Tindakan ini akan menyembunyikan pelanggan dari daftar. Anda bisa mengaktifkannya kembali nanti."
                />
            )}
        </IndexPageLayout>
    );
}
