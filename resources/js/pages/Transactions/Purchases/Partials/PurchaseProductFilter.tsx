import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

export default function PurchaseProductFilter({
    productTypes,
    params,
    setFilter,
    isInternalMode,
    isWarehouseSelected,
}) {
    const { t } = useTranslation();

    return (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth -mx-1 px-1">
            <button
                type="button"
                onClick={() => setFilter('type_id', 'all')}
                disabled={isInternalMode && !isWarehouseSelected}
                className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border snap-start flex-shrink-0',
                    params.type_id === 'all' || !params.type_id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/30',
                    isInternalMode &&
                    !isWarehouseSelected &&
                    'opacity-50 cursor-not-allowed'
                )}
            >
                {t('ui.all')}
            </button>
            {productTypes.map((type) => (
                <button
                    key={type.id}
                    type="button"
                    onClick={() => setFilter('type_id', type.id.toString())}
                    disabled={isInternalMode && !isWarehouseSelected}
                    className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border snap-start flex-shrink-0',
                        params.type_id === type.id.toString()
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/30',
                        isInternalMode &&
                        !isWarehouseSelected &&
                        'opacity-50 cursor-not-allowed'
                    )}
                >
                    {type.name}
                </button>
            ))}
        </div>
    );
}
