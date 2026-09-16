import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

export type InfoField = {
    label?: React.ReactNode;
    value?: string | number | React.ReactNode;
    badge?: string;
    badgeVariant?: any;
    badgeClassName?: string;
    span?: 'full' | string | number;
    hidden?: boolean;
    [key: string]: unknown;
};

export type TransactionInfoGridProps = {
    title: string;
    subtitle?: string;
    fields: Array<InfoField | any>;
};

export default function TransactionInfoGrid({ title, subtitle, fields }: TransactionInfoGridProps) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-3.5 sm:p-4 pb-2 sm:pb-2.5">
                <h3 className="text-xs sm:text-sm font-semibold">{title}</h3>
                {subtitle && <p className="text-[11px] font-mono mt-0.5">{subtitle}</p>}
            </div>
            <div className="p-3.5 sm:p-4 pt-0 sm:pt-0 grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-2.5 sm:gap-y-3 text-xs">
                {fields.map((field, index) => {
                    if (!field || field.hidden) return null;

                    return (
                        <div
                            key={index}
                            className={cn(
                                field.span === 'full' && 'col-span-2 sm:col-span-3',
                                field.span === 2 && 'col-span-2'
                            )}
                        >
                            <p className="text-[11px] sm:text-xs text-muted-foreground">
                                {field.label}
                            </p>
                            {field.badge ? (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    {field.value && (
                                        <span className="font-semibold text-xs sm:text-sm text-foreground">
                                            {field.value}
                                        </span>
                                    )}
                                    <Badge
                                        variant={field.badgeVariant || 'outline'}
                                        className={cn('capitalize text-[11px] px-1.5 py-0 h-4.5', field.badgeClassName)}
                                    >
                                        {field.badge}
                                    </Badge>
                                </div>
                            ) : (
                                typeof field.value === 'string' || typeof field.value === 'number' ? (
                                    <p className="font-semibold text-xs sm:text-sm text-foreground mt-0.5 leading-snug">
                                        {field.value || '-'}
                                    </p>
                                ) : (
                                    <div className="font-semibold text-xs sm:text-sm text-foreground mt-0.5 leading-snug">
                                        {field.value || '-'}
                                    </div>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
