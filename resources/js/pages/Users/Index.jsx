import { Link, router, usePage } from '@inertiajs/react';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { useSoftDeletes } from '@/hooks/useSoftDeletes';
import { userColumns } from '@/constants/tableColumns.jsx';
import IndexPageLayout from '@/components/IndexPageLayout';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import DataTable from '@/components/DataTable';
import MobileCardList from '@/components/MobileCardList';
import UserMobileCard from './Partials/UserMobileCard';
import Pagination from '@/components/Pagination';
import UserFilterCard from './Partials/UserFilterCard';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Archive, ArchiveRestore } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Index({ auth, users, roles, filters = {} }) {
    const { can } = usePage().props.auth;
    const canManageUsers = can.manage_system;

    const { params, setFilter } = useIndexPageFilters('users.index', filters, 'name_asc');

    const {
        confirmingDeletion,
        setConfirmingDeletion,
        isProcessing,
        itemToDeactivate,
        deactivateItem,
        restoreItem,
    } = useSoftDeletes({ resourceName: 'users', data: users.data });

    const renderActionDropdown = (user) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => router.get(route('users.edit', user.id))}
                >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>

                {user.deleted_at ? (
                    <DropdownMenuItem
                        className="cursor-pointer text-success focus:text-success"
                        onSelect={() => restoreItem(user.id)}
                    >
                        <ArchiveRestore className="w-4 h-4 mr-2" /> Aktifkan
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setConfirmingDeletion(user.id)}
                        disabled={user.id === auth.user.id}
                    >
                        <Archive className="w-4 h-4 mr-2" /> Nonaktifkan
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Pengguna"
            createRoute={canManageUsers ? 'users.create' : null}
            buttonLabel="Tambah Pengguna"
        >
            <div className="space-y-4">
                <UserFilterCard params={params} setFilter={setFilter} roles={roles} />

                <MobileCardList
                    data={users.data}
                    renderItem={(user) => (
                        <Link
                            href={canManageUsers ? route('users.edit', user.id) : '#'}
                            key={user.id}
                            className={cn(
                                'block',
                                !canManageUsers && 'pointer-events-none',
                                user.deleted_at && 'opacity-50'
                            )}
                        >
                            <UserMobileCard
                                user={user}
                                renderActionDropdown={canManageUsers ? renderActionDropdown : null}
                            />
                        </Link>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={userColumns}
                        data={users.data}
                        actions={canManageUsers ? renderActionDropdown : null}
                        showRoute={canManageUsers ? 'users.edit' : null}
                        rowClassName={(row) => (row.deleted_at ? 'opacity-50' : '')}
                    />
                </div>

                {users.data.length > 0 && <Pagination links={users.meta.links} />}
            </div>

            {canManageUsers && (
                <DeleteConfirmationDialog
                    open={confirmingDeletion !== null}
                    onOpenChange={() => setConfirmingDeletion(null)}
                    onConfirm={deactivateItem}
                    isDeleting={isProcessing}
                    title={`Nonaktifkan User ${itemToDeactivate?.name}?`}
                    confirmText="Nonaktifkan"
                    description="User ini tidak akan bisa login lagi sampai diaktifkan kembali."
                />
            )}
        </IndexPageLayout>
    );
}
