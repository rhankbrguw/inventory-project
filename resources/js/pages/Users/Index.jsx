import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
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
import { Edit, Trash2, MoreVertical } from 'lucide-react';

export default function Index({ auth, users, roles, filters = {} }) {
    const { params, setFilter } = useIndexPageFilters(
        'users.index',
        filters,
        'name_asc'
    );
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const deleteUser = () => {
        setIsProcessing(true);
        router.delete(route('users.destroy', confirmingUserDeletion), {
            preserveScroll: true,
            onSuccess: () => setConfirmingUserDeletion(null),
            onFinish: () => setIsProcessing(false),
        });
    };

    const userToDelete = users.data.find(
        (u) => u.id === confirmingUserDeletion
    );

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
                <Link href={route('users.edit', user.id)}>
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
                <UserFilterCard
                    params={params}
                    setFilter={setFilter}
                    roles={roles}
                />

                <MobileCardList
                    data={users.data}
                    renderItem={(user) => (
                        <Link href={route('users.edit', user.id)} key={user.id}>
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
                        showRoute={'users.edit'}
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
                isDeleting={isProcessing}
                title={`Hapus Pengguna ${userToDelete?.name}?`}
                confirmText="Hapus Pengguna"
                description="Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun pengguna secara permanen dari sistem."
            />
        </IndexPageLayout>
    );
}
