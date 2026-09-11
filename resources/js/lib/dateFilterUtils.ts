import {
    format,
    subDays,
    startOfMonth,
    endOfMonth,
    isSameYear,
} from 'date-fns';
import { id } from 'date-fns/locale';

export const getInitialDateState = (filters) => {
    const range = filters.date_range || 'this_month';

    if (range === 'custom' && filters.start_date && filters.end_date) {
        return {
            from: new Date(filters.start_date),
            to: new Date(filters.end_date),
        };
    }

    const today = new Date();
    if (range === 'today') return { from: today, to: today };
    if (range === 'last_7_days') return { from: subDays(today, 6), to: today };

    return {
        from: startOfMonth(today),
        to: endOfMonth(today),
    };
};

export const getPresets = (t) => [
    {
        label: t('ui.today'),
        getValue: () => ({ from: new Date(), to: new Date() }),
        key: 'today',
    },
    {
        label: t('ui.last_7_days'),
        getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }),
        key: 'last_7_days',
    },
    {
        label: t('ui.this_month'),
        getValue: () => ({
            from: startOfMonth(new Date()),
            to: endOfMonth(new Date()),
        }),
        key: 'this_month',
    },
];

export const getDisplayLabel = (filters, date, t) => {
    const tr = typeof t === 'function' ? t : (k) => k;
    const today = new Date();

    if (filters.date_range === 'today') return format(today, 'd MMM', { locale: id });
    if (filters.date_range === 'last_7_days') {
        return `${format(subDays(today, 6), 'd MMM', { locale: id })} - ${format(today, 'd MMM', { locale: id })}`;
    }
    if (filters.date_range === 'this_month') return format(today, 'MMMM', { locale: id });

    if (date?.from) {
        if (!date.to) return format(date.from, 'd MMM yy', { locale: id });
        const sameYear = isSameYear(date.from, today) && isSameYear(date.to, today);
        const fmt = sameYear ? 'd MMM' : 'd MMM yy';
        return `${format(date.from, fmt, { locale: id })} - ${format(date.to, fmt, { locale: id })}`;
    }

    return tr('ui.select_period');
};
