import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useTranslation from '@/hooks/useTranslation';
import { Globe, MapPin, Building2 } from 'lucide-react';

export default function UserLocationsCell({ user, t: tProp }) {
    const { t: tHook } = useTranslation();
    const t = tProp || tHook;
    if (user.level === 1) {
        return (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-medium py-0.5 px-2">
                <Globe className="w-3 h-3 mr-1" />
                {t('ui.global_access')}
            </Badge>
        );
    }

    const locations = user.locations || [];
    if (locations.length === 0) {
        return <span className="text-muted-foreground text-xs italic">{t('ui.no_locations_assigned')}</span>;
    }

    const maxVisible = 2;
    const visibleLocations = locations.slice(0, maxVisible);
    const hiddenCount = locations.length - maxVisible;

    return (
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {visibleLocations.map((loc) => (
                <Badge key={loc.id} variant="secondary" className="text-xs font-normal py-0.5 px-2">
                    <MapPin className="w-3 h-3 mr-1 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[100px]">{loc.name}</span>
                    {loc.role_code && <span className="ml-1 text-[10px] font-semibold text-muted-foreground">({loc.role_code})</span>}
                </Badge>
            ))}
            {hiddenCount > 0 && (
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center"
                        >
                            <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs font-medium py-0.5 px-1.5 transition-colors">
                                <Building2 className="w-3 h-3 mr-1" />
                                +{hiddenCount} {t('ui.more_locations')}
                            </Badge>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 shadow-lg" align="center" onClick={(e) => e.stopPropagation()}>
                        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5 border-b pb-1.5">
                            <Building2 className="w-3.5 h-3.5 text-primary" /> {t('ui.all_assigned_locations')} ({locations.length})
                        </p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {locations.map((loc) => (
                                <div key={loc.id} className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-muted/50 transition-colors">
                                    <span className="font-medium text-foreground truncate max-w-[150px]">{loc.name}</span>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                                        {loc.role_code || loc.type?.name || t('ui.branch')}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}
