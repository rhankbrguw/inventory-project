import { router } from '@inertiajs/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Archive, ArchiveRestore } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export function ProductActionsDropdown({ product, restoreItem, setConfirmingDeletion }) {
    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreVertical className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onSelect={() => router.get(route('products.edit', product.id))}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                {product.deleted_at ? (
                    <DropdownMenuItem className="cursor-pointer text-success focus:text-success" onSelect={() => restoreItem(product.id)}>
                        <ArchiveRestore className="w-4 h-4 mr-2" /> {t('ui.activate')}
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onSelect={() => setConfirmingDeletion(product.id)}>
                        <Archive className="w-4 h-4 mr-2" /> {t('ui.deactivate')}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
