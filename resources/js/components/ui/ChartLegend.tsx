import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';
import { useChart } from './chartContext';
import { getPayloadConfigFromPayload } from './chartUtils';

export const ChartLegend = RechartsPrimitive.Legend;

type ChartLegendPayloadItem = {
    type?: string;
    value?: string | number;
    dataKey?: string | number;
    color?: string;
};

type ChartLegendContentProps = React.ComponentProps<'div'> & {
    hideIcon?: boolean;
    payload?: ChartLegendPayloadItem[];
    verticalAlign?: 'top' | 'bottom';
    nameKey?: string;
};

export const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(({ className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey }, ref) => {
    const { config } = useChart();
    if (!payload?.length) return null;

    return (
        <div ref={ref} className={cn('flex items-center justify-center gap-4', verticalAlign === 'top' ? 'pb-3' : 'pt-3', className)}>
            {payload.filter((item) => item.type !== 'none').map((item, index) => {
                const key = `${nameKey || item.dataKey || 'value'}`;
                const itemConfig = getPayloadConfigFromPayload(config, item as Record<string, unknown>, key);
                const itemKey = item.value ?? item.dataKey ?? `legend-${index}`;

                return (
                    <div key={String(itemKey)} className={cn('flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground')}>
                        {itemConfig?.icon && !hideIcon ? <itemConfig.icon /> : <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color ?? itemConfig?.color ?? 'currentColor' }} />}
                        {itemConfig?.label}
                    </div>
                );
            })}
        </div>
    );
});
ChartLegendContent.displayName = 'ChartLegend';
