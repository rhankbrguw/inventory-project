import type { ChartConfig, ChartConfigValue } from './chartContext';

export const THEMES = {
    light: '',
    dark: '.dark',
};

export function getPayloadConfigFromPayload(
    config: ChartConfig,
    payload: Record<string, unknown> | undefined,
    key: string,
): ChartConfigValue | undefined {
    if (!payload || typeof payload !== 'object') return undefined;

    const payloadPayload = 'payload' in payload && payload.payload && typeof payload.payload === 'object'
        ? (payload.payload as Record<string, unknown>)
        : undefined;

    let configLabelKey = key;

    const itemValue = payload[key as keyof typeof payload];
    if (typeof itemValue === 'string') {
        configLabelKey = itemValue;
    } else if (payloadPayload) {
        const nestedValue = payloadPayload[key as keyof typeof payloadPayload];
        if (typeof nestedValue === 'string') {
            configLabelKey = nestedValue;
        }
    }

    return config[configLabelKey] ?? config[key];
}
