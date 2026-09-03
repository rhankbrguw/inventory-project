import { Card, CardContent } from '@/components/ui/card';
import { MapPinOff } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function NoLocationAssigned() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] p-4">
            <Card className="w-full max-w-md bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="p-4 rounded-full bg-muted">
                        <MapPinOff className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">
                            {t('ui.no_location_assigned')}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            {t('ui.no_location_assigned_desc')}
                        </p>
                    </div>
                    <div className="text-xs text-muted-foreground bg-background px-3 py-2 rounded border">
                        {t('ui.contact_super_admin_assignment')}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
