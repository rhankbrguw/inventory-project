import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type StatCardProps = {
    title: string;
    value: string | number;
    subtext?: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    valueColor?: string;
};

const getValueSizeClass = (val: string | number): string => {
    const len = String(val).length;
    if (len > 16) {
        return 'text-sm sm:text-lg';
    }
    if (len > 12) {
        return 'text-base sm:text-xl';
    }
    return 'text-lg sm:text-2xl';
};

export default function StatCard({
    title,
    value,
    subtext,
    icon: Icon,
    iconBg,
    iconColor,
    valueColor,
}: StatCardProps) {
    return (
        <Card className="h-full border-l-4 border-l-transparent hover:border-l-primary/50 transition-all flex flex-col">
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground truncate mr-1">
                    {title}
                </CardTitle>
                <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${iconBg}`}>
                    <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${iconColor}`} />
                </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-0.5 sm:space-y-1">
                <div
                    className={`font-bold tracking-tight tabular-nums truncate ${getValueSizeClass(value)} ${valueColor || ''}`}
                    title={String(value)}
                >
                    {value}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{subtext}</p>
            </CardContent>
        </Card>
    );
}
