import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { cn, getNormalizedDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useTranslation from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { getInitialDateState, getPresets, getDisplayLabel } from '@/lib/dateFilterUtils';

type SmartDateFilterProps = {
    filters: {
        date_range?: string;
        start_date?: string | null;
        end_date?: string | null;
    };
    onFilterChange: (next: { date_range: string; start_date: string | null; end_date: string | null }) => void;
};

export default function SmartDateFilter({ filters, onFilterChange }: SmartDateFilterProps) {
    const { t } = useTranslation();
    const [date, setDate] = useState<DateRange | undefined>(() => getInitialDateState(filters));
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setDate(getInitialDateState(filters));
    }, [filters.date_range, filters.start_date, filters.end_date]);

    const presets = getPresets(t);

    const handlePresetClick = (preset: { key: string; getValue: () => DateRange; label: string }) => {
        const nextRange = preset.getValue();
        setDate(nextRange);
        onFilterChange({ date_range: preset.key, start_date: null, end_date: null });
        setIsOpen(false);
    };

    const applyCustomFilter = () => {
        if (date?.from) {
            const normalizedFrom = getNormalizedDate(date.from);
            const normalizedTo = date.to ? getNormalizedDate(date.to) : normalizedFrom;
            onFilterChange({
                date_range: 'custom',
                start_date: format(normalizedFrom, 'yyyy-MM-dd'),
                end_date: format(normalizedTo, 'yyyy-MM-dd'),
            });
            setIsOpen(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full h-9 px-3 font-normal justify-start', !date && 'text-muted-foreground')}>
                    <div className="flex items-center gap-2 min-w-0">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate text-xs capitalize">{getDisplayLabel(filters, date, t)}</span>
                    </div>
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50 flex-shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col sm:flex-row">
                    <div className="border-b sm:border-b-0 sm:border-r py-2 w-full sm:w-[140px] bg-muted/10">
                        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-left">
                            {t('ui.quick_period')}
                        </div>
                        <div className="flex flex-row sm:flex-col gap-1 px-2 overflow-x-auto sm:overflow-visible">
                            {presets.map((preset) => (
                                <Button
                                    key={preset.key}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        'justify-center sm:justify-start text-[11px] sm:text-xs font-normal h-7 sm:h-8 whitespace-nowrap flex-shrink-0',
                                        filters.date_range === preset.key && 'bg-primary/10 text-primary font-medium'
                                    )}
                                    onClick={() => handlePresetClick(preset)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={1}
                            locale={id}
                            className="p-2 sm:p-3"
                            captionLayout="dropdown"
                            fromYear={2020}
                            toYear={2030}
                        />
                        <div className="flex items-center justify-between p-3 border-t bg-muted/10">
                            <Button variant="ghost" size="sm" onClick={() => setDate(undefined)} className="h-7 text-xs text-muted-foreground hover:text-destructive">
                                {t('ui.reset')}
                            </Button>
                            <Button size="sm" onClick={applyCustomFilter} disabled={!date?.from} className="h-7 text-xs">
                                {t('ui.apply')}
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
