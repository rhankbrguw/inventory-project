import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatGroupName, cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

export default function TypeMobileCard({ type, renderActionDropdown }) {
    const { t } = useTranslation();
    const isInactive = !!type.deleted_at;
    return (
        <Card
            key={type.id}
            className={cn(isInactive && 'opacity-50 bg-muted/50')}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                    {type.name}
                </CardTitle>
                {renderActionDropdown && renderActionDropdown(type)}
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">
                    {formatGroupName(type.group)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">
                        {type.code || t('ui.no_code')}
                    </span>
                    <Badge variant={isInactive ? 'destructive' : 'success'}>
                        {isInactive ? t('ui.status_inactive') : t('ui.status_active')}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
