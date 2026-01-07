import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function TransactionInfoGrid({ title, subtitle, fields }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {subtitle && <CardDescription>{subtitle}</CardDescription>}
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                {fields.map((field, index) => {
                    if (!field || field.hidden) return null;

                    return (
                        <div
                            key={index}
                            className={cn(
                                field.span === 'full' && 'sm:col-span-3',
                                field.span === 2 && 'sm:col-span-2'
                            )}
                        >
                            <p className="text-muted-foreground">
                                {field.label}
                            </p>
                            {field.badge ? (
                                <div className="flex items-center gap-2 mt-1">
                                    {field.value && (
                                        <span className="font-semibold">
                                            {field.value}
                                        </span>
                                    )}
                                    <Badge
                                        variant={
                                            field.badgeVariant || 'outline'
                                        }
                                        className={cn(
                                            'capitalize',
                                            field.badgeClassName
                                        )}
                                    >
                                        {field.badge}
                                    </Badge>
                                </div>
                            ) : (
                                <p className="font-semibold mt-1">
                                    {field.value || '-'}
                                </p>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
