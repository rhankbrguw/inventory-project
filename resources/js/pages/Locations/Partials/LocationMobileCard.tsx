import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UnifiedBadge from '@/components/UnifiedBadge';
import { cn } from '@/lib/utils';
import LocationOfficersCell from './LocationOfficersCell';
import useTranslation from '@/hooks/useTranslation';

export default function LocationMobileCard({ location, renderActionDropdown }) {
    const { t } = useTranslation();
    const isInactive = !!location.deleted_at;

    return (
        <Card className={cn(isInactive && 'opacity-50 bg-muted/50')}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1.5">
                    <CardTitle className="text-base">{location.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {location.address || t('ui.no_address')}
                    </p>
                </div>
                {renderActionDropdown && renderActionDropdown(location)}
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={isInactive ? 'destructive' : 'success'}>
                        {isInactive ? t('ui.inactive') : t('ui.active')}
                    </Badge>
                    {location.type?.name ? (
                        <UnifiedBadge
                            text={location.type.name}
                            code={location.type.code}
                        />
                    ) : (
                        <Badge variant="outline">{t('ui.no_type')}</Badge>
                    )}
                </div>
                <div className="pt-2 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">{t('ui.officers')}:</span>
                    <LocationOfficersCell users={location.users} t={t} />
                </div>
            </CardContent>
        </Card>
    );
}
