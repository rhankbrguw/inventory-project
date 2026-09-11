import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import DashboardMobileCard from './DashboardMobileCard';
import EmptyState from '@/components/EmptyState';

export default function ActivityList({ data, t }) {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="pb-1 pt-3.5 px-4">
                <CardTitle className="text-sm font-semibold">
                    {t('ui.recent_activity')}
                </CardTitle>
                <CardDescription className="text-xs">
                    {t('ui.last_6_movements')}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[220px] pt-1 px-3 pb-3">
                {data?.length > 0 ? (
                    <div className="space-y-0">
                        {data.map((movement) => (
                            <DashboardMobileCard
                                key={movement.id}
                                movement={movement}
                                compact={true}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Activity}
                        title={t('ui.no_activity')}
                        description={t('ui.no_activity_desc')}
                    />
                )}
            </CardContent>
        </Card>
    );
}
