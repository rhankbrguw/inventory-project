import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UnifiedBadge from '@/components/UnifiedBadge';
import { Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserLocationsCell from './UserLocationsCell';
import useTranslation from '@/hooks/useTranslation';

export default function UserMobileCard({ user, renderActionDropdown }) {
    const { t } = useTranslation();
    const isInactive = !!user.deleted_at;

    return (
        <Card className={cn(isInactive && 'opacity-50 bg-muted/50')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                    {user.name}
                </CardTitle>
                {renderActionDropdown && renderActionDropdown(user)}
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{user.phone}</span>
                        </div>
                    )}
                </div>
                <div className="pt-2 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">{t('ui.location')}:</span>
                    <UserLocationsCell user={user} t={t} />
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <UnifiedBadge
                        text={user.role?.name}
                        level={user.role?.level}
                    />
                    {user.role?.code && (
                        <span className="text-[10px] font-mono text-muted-foreground border px-1.5 py-0.5 rounded">
                            {user.role.code}
                        </span>
                    )}
                    <Badge variant={isInactive ? 'destructive' : 'success'}>
                        {isInactive ? t('ui.inactive') : t('ui.active')}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
