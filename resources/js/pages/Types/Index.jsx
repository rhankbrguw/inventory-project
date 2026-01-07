import { Link, router, usePage } from '@inertiajs/react';
import { useIndexPageFilters } from '@/hooks/useIndexPageFilters';
import { useSoftDeletes } from '@/hooks/useSoftDeletes';
import { typeColumns } from '@/constants/tableColumns.jsx';
import IndexPageLayout from '@/components/IndexPageLayout';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import DataTable from '@/components/DataTable';
import MobileCardList from '@/components/MobileCardList';
import TypeMobileCard from './Partials/TypeMobileCard';
import Pagination from '@/components/Pagination';
import TypeFilterCard from './Partials/TypeFilterCard';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Archive, ArchiveRestore } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Index({ auth, types, filters = {}, groups = {} }) {
    const { can } = usePage().props.auth;
    const canManageTypes = can.manage_system;

    const { params, setFilter } = useIndexPageFilters('types.index', filters);

    const {
        confirmingDeletion,
        setConfirmingDeletion,
        isProcessing,
        itemToDeactivate,
        deactivateItem,
        restoreItem,
    } = useSoftDeletes({ resourceName: 'types', data: types.data });

    const renderActionDropdown = (type) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => router.get(route('types.edit', type.id))}
                >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>

                {type.deleted_at ? (
                    <DropdownMenuItem
                        className="cursor-pointer text-success focus:text-success"
                        onSelect={() => restoreItem(type.id)}
                    >
                        <ArchiveRestore className="w-4 h-4 mr-2" /> Aktifkan
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onSelect={() => setConfirmingDeletion(type.id)}
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
            title="Manajemen Tipe"
            createRoute={canManageTypes ? 'types.create' : null}
            buttonLabel="Tambah Tipe Baru"
        >
            <div className="space-y-4">
                <TypeFilterCard params={params} setFilter={setFilter} groups={groups} />

                <MobileCardList
                    data={types.data}
                    renderItem={(type) => (
                        <Link
                            href={canManageTypes ? route('types.edit', type.id) : '#'}
                            key={type.id}
                            className={cn(
                                'block',
                                !canManageTypes && 'pointer-events-none',
                                type.deleted_at && 'opacity-50'
                            )}
                        >
                            <TypeMobileCard
                                type={type}
                                renderActionDropdown={canManageTypes ? renderActionDropdown : null}
                            />
                        </Link>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={typeColumns}
                        data={types.data}
                        actions={canManageTypes ? renderActionDropdown : null}
                        showRoute={canManageTypes ? 'types.edit' : null}
                        rowClassName={(row) => (row.deleted_at ? 'opacity-50' : '')}
                    />
                </div>

                {types.data.length > 0 && <Pagination links={types.meta.links} />}
            </div>

            {canManageTypes && (
                <DeleteConfirmationDialog
                    open={confirmingDeletion !== null}
                    onOpenChange={() => setConfirmingDeletion(null)}
                    onConfirm={deactivateItem}
                    isDeleting={isProcessing}
                    title={`Nonaktifkan Tipe ${itemToDeactivate?.name}?`}
                    confirmText="Nonaktifkan"
                    description="Tipe ini akan disembunyikan dari pilihan dropdown."
                />
            )}
        </IndexPageLayout>
    );
}
