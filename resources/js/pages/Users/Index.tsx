import { Link, router } from '@inertiajs/react';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { useSoftDeletes } from '@/hooks/useSoftDeletes';
import { userColumns } from '@/constants/tableColumns/userColumns';
import useTranslation from '@/hooks/useTranslation';
import IndexPageLayout from '@/components/IndexPageLayout';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import DataTable from '@/components/DataTable';
import MobileCardList from '@/components/MobileCardList';
import UserMobileCard from './Partials/UserMobileCard';
import Pagination from '@/components/Pagination';
import UserFilterCard from './Partials/UserFilterCard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Archive, ArchiveRestore } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';

export default function Index({ auth, users, roles, locations, filters = {} }: { auth?: any; users: any; roles?: any; locations?: any; filters?: any }) {
    const { can } = usePermission();
    const { t } = useTranslation();
    const canManageUsers = can.manage_system;

    const { params, setFilter, isFiltered } = useIndexPageFilters('users.index', filters, 'name_asc');

    const { confirmingDeletion, setConfirmingDeletion, isProcessing, itemToDeactivate, deactivateItem, restoreItem } = useSoftDeletes({ resourceName: 'users', data: users.data });

    const renderActionDropdown = (user: any) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onSelect={() => router.get(route('users.edit', user.id))}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>

                {user.deleted_at ? (
                    <DropdownMenuItem className="cursor-pointer text-success focus:text-success" onSelect={() => restoreItem(user.id)}>
                        <ArchiveRestore className="w-4 h-4 mr-2" /> {t('ui.activate')}
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => setConfirmingDeletion(user.id)} disabled={user.id === auth?.user?.id}>
                        <Archive className="w-4 h-4 mr-2" /> {t('ui.deactivate')}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <IndexPageLayout auth={auth} title={t('ui.users_management')} createRoute={canManageUsers ? 'users.create' : undefined} buttonLabel={t('ui.add_user')}>
            <div className="space-y-4">
                <UserFilterCard params={params} setFilter={setFilter} roles={roles} locations={locations} />

                <MobileCardList
                    data={users.data}
                    isFiltered={isFiltered}
                    renderItem={(user: any) => (
                        <Link href={canManageUsers ? route('users.edit', user.id) : '#'} key={user.id} className={cn('block', !canManageUsers && 'pointer-events-none', user.deleted_at && 'opacity-50')}>
                            <UserMobileCard user={user} renderActionDropdown={canManageUsers ? renderActionDropdown : null} />
                        </Link>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={userColumns(t)}
                        data={users.data}
                        isFiltered={isFiltered}
                        actions={canManageUsers ? renderActionDropdown : null}
                        showRoute={canManageUsers ? 'users.edit' : null}
                        rowClassName={(row: any) => (row.deleted_at ? 'opacity-50' : '')}
                    />
                </div>

                {users.data.length > 0 && <Pagination links={users.meta.links} meta={users.meta} />}
            </div>

            {canManageUsers && (
                <DeleteConfirmationDialog
                    open={confirmingDeletion !== null}
                    onOpenChange={() => setConfirmingDeletion(null)}
                    onConfirm={deactivateItem}
                    isDeleting={isProcessing}
                    title={t('ui.deactivate_confirm', { name: String((itemToDeactivate as any)?.name ?? '') })}
                    confirmText={t('ui.deactivate')}
                    description={t('ui.deactivate_desc')}
                />
            )}
        </IndexPageLayout>
    );
}
