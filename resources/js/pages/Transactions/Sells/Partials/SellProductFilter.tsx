import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';
import SellLocationChannelFilter from './SellLocationChannelFilter';

export default function SellProductFilter({ locations, selectedLocationId, onLocationChange, productTypes, salesChannels, selectedChannelId, onChannelChange, params, setFilter }) {
    const { t } = useTranslation();
    const selectedType = params.type_id || 'all';

    return (
        <div className="space-y-3">
            <SellLocationChannelFilter
                locations={locations} selectedLocationId={selectedLocationId} onLocationChange={onLocationChange}
                salesChannels={salesChannels} selectedChannelId={selectedChannelId} onChannelChange={onChannelChange}
            />
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth -mx-1 px-1">
                <button
                    type="button" onClick={() => setFilter('type_id', 'all')}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border', selectedType === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/30')}
                >
                    {t('ui.all')}
                </button>
                {productTypes.map((type) => (
                    <button
                        key={type.id} type="button" onClick={() => setFilter('type_id', type.id.toString())}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border', selectedType === type.id.toString() ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/30')}
                    >
                        {type.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
