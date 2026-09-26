import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UnifiedBadge from '@/components/UnifiedBadge';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

export default function SupplierMobileCard({ supplier, renderActionDropdown }: { supplier: any; renderActionDropdown?: any }) {
    const { t } = useTranslation();
    const isInactive = !!supplier.deleted_at;

    return (
        <Card
            key={supplier.id}
            className={cn(isInactive && 'opacity-50 bg-muted/50')}
        >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base">{supplier.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {supplier.contact_person || t('ui.no_coordinator')}
                    </p>
                </div>
                {renderActionDropdown && renderActionDropdown(supplier)}
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                    {supplier.email || '-'} | {supplier.phone || '-'}
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={isInactive ? 'destructive' : 'success'}>
                        {isInactive ? t('ui.status_inactive') : t('ui.status_active')}
                    </Badge>
                    <UnifiedBadge
                        text={supplier.is_global ? t('ui.global') : t('ui.branch')}
                        className="capitalize"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
