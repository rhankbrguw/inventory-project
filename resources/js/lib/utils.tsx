import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { startOfDay } from 'date-fns';

export function cn(...inputs: Parameters<typeof clsx>): string {
    return twMerge(clsx(inputs));
}

type SupportedLocale = 'en' | 'id';
type DateInput = string | number | Date;

const getBrowserLocale = (appLocale: SupportedLocale): string => {
    return appLocale === 'en' ? 'en-US' : 'id-ID';
};

export const getNormalizedDate = (date?: DateInput | null): Date => {
    if (!date) {
        return startOfDay(new Date());
    }

    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Date(date + 'T00:00:00');
    }

    const d = date instanceof Date ? date : new Date(date);
    return startOfDay(d);
};

export function formatCurrency(amount: number | string, locale: SupportedLocale = 'id'): string {
    const numberAmount = Number(amount);
    if (isNaN(numberAmount)) {
        return locale === 'en' ? '$0' : 'Rp0';
    }

    const browserLocale = getBrowserLocale(locale);
    const currency = locale === 'en' ? 'USD' : 'IDR';
    const isIdr = currency === 'IDR';
    const roundedAmount = isIdr ? Math.round(numberAmount) : numberAmount;
    const hasDecimal = !isIdr && roundedAmount % 1 !== 0;

    return new Intl.NumberFormat(browserLocale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: hasDecimal ? 2 : 0,
    }).format(roundedAmount);
}

export function formatDate(dateString?: DateInput | null, locale: SupportedLocale = 'id'): string {
    if (!dateString) return '-';

    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';

    const browserLocale = getBrowserLocale(locale);

    return date.toLocaleDateString(browserLocale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function formatTime(dateString?: DateInput | null, locale: SupportedLocale = 'id'): string {
    if (!dateString) return '-';

    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';

    const browserLocale = getBrowserLocale(locale);

    return new Intl.DateTimeFormat(browserLocale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: locale === 'en',
    }).format(date);
}

export function formatRelativeTime(isoString?: string | null, locale: SupportedLocale = 'id'): string {
    if (!isoString) return '-';

    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (locale === 'en') {
        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        return `${days} days ago`;
    }

    if (seconds < 60) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
}

export function formatGroupName(groupName?: string | null): string {
    if (!groupName) return '';
    return groupName
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function formatNumber(value: number | string, locale: SupportedLocale = 'id'): string {
    const numberValue = Number(value);
    if (isNaN(numberValue)) {
        return '0';
    }

    const browserLocale = getBrowserLocale(locale);

    if (numberValue % 1 === 0) {
        return numberValue.toLocaleString(browserLocale, {
            useGrouping: true,
            maximumFractionDigits: 0,
        });
    }

    return numberValue.toLocaleString(browserLocale, {
        useGrouping: true,
        maximumFractionDigits: 4,
        minimumFractionDigits: 0,
    });
}
