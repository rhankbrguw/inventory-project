import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';
import { ChartContext, useChart } from './chartContext';
import { THEMES } from './chartUtils';
import { ChartTooltip, ChartTooltipContent } from './ChartTooltip';
import { ChartLegend, ChartLegendContent } from './ChartLegend';

type ChartConfigValue = {
    label?: string;
    icon?: React.ComponentType<{ className?: string }>;
    theme?: Partial<Record<'light' | 'dark', string>>;
    color?: string;
};

type ChartConfig = Record<string, ChartConfigValue>;

type ChartContainerProps = React.ComponentProps<'div'> & {
    id?: string;
    config: ChartConfig;
    children: React.ReactElement;
};

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                data-chart={chartId}
                ref={ref}
                className={cn("flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line]:stroke-border [&_.recharts-sector]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none", className)}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    );
});
ChartContainer.displayName = 'Chart';

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
    const colorConfig = Object.entries(config).filter(([, value]) => value.theme || value.color);

    if (!colorConfig.length) return null;

    const css = Object.entries(THEMES)
        .map(([theme, prefix]) => {
            const piece = colorConfig
                .map(([key, itemConfig]) => {
                    const color = itemConfig.theme?.[theme as 'light' | 'dark'] || itemConfig.color;
                    return color ? `  --color-${key}: ${color};` : null;
                })
                .filter(Boolean)
                .join('\n');

            return `${prefix} [data-chart=${id}] {\n${piece}\n}`;
        })
        .join('\n');

    return <style dangerouslySetInnerHTML={{ __html: css }} />;
};

export {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    ChartStyle,
    useChart,
};
