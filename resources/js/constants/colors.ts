export const COLORS = {
    PRIMARY: 'hsl(var(--primary))',
    PRIMARY_FOREGROUND: 'hsl(var(--primary-foreground))',
    BACKGROUND: 'hsl(var(--background))',
    FOREGROUND: 'hsl(var(--foreground))',
    MUTED: 'hsl(var(--muted))',
    MUTED_FOREGROUND: 'hsl(var(--muted-foreground))',
    BORDER: 'hsl(var(--border))',
    BORDER_MUTED: 'hsl(var(--border) / 0.6)',
    DESTRUCTIVE: 'hsl(var(--destructive))',
    SUCCESS: 'hsl(var(--success))',
    INFO: 'hsl(var(--info))',
    WARNING: 'hsl(var(--warning))',
    CHART_1: 'hsl(var(--chart-1))',
    CHART_2: 'hsl(var(--chart-2))',
    CHART_3: 'hsl(var(--chart-3))',
    CHART_4: 'hsl(var(--chart-4))',
    CHART_5: 'hsl(var(--chart-5))',
} as const;

export const CHART_PALETTE = [
    COLORS.CHART_1,
    COLORS.CHART_2,
    COLORS.CHART_3,
    COLORS.CHART_4,
    COLORS.CHART_5,
] as const;
