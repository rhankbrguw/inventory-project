import * as React from 'react';

export type ChartConfigValue = {
    label?: string;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    theme?: Partial<Record<'light' | 'dark', string>>;
};

export type ChartConfig = Record<string, ChartConfigValue>;

type ChartContextValue = {
    config: ChartConfig;
};

export const ChartContext = React.createContext<ChartContextValue | null>(null);

export function useChart(): ChartContextValue {
    const context = React.useContext(ChartContext);

    if (!context) {
        throw new Error('useChart must be used within a <ChartContainer />');
    }

    return context;
}
