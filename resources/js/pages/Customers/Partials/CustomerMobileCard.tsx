import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UnifiedBadge from '@/components/UnifiedBadge';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

export default function CustomerMobileCard({ customer, renderActionDropdown }) {
    const { t } = useTranslation();
    const isInactive = !!customer.deleted_at;
    return (
        <Card className={cn(isInactive && 'opacity-50 bg-muted/50')}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1.5">
                    <CardTitle className="text-sm font-medium">
                        {customer.name}
                    </CardTitle>
                    <UnifiedBadge text={customer.type?.name} />
                </div>
                {renderActionDropdown && renderActionDropdown(customer)}
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground space-y-1 mb-2">
                    <p>{customer.email}</p>
                    <p>{customer.phone || t('ui.no_phone')}</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={isInactive ? 'destructive' : 'success'}>
                        {isInactive ? t('ui.status_inactive') : t('ui.status_active')}
                    </Badge>
                    <UnifiedBadge
                        text={customer.is_global ? t('ui.global') : t('ui.branch')}
                        className="capitalize"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
