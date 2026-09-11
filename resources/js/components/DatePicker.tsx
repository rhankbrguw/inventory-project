import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn, getNormalizedDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
import useTranslation from '@/hooks/useTranslation';
import type React from 'react';

type DatePickerProps = {
    value?: Date;
    onSelect?: (date: Date) => void;
    className?: string;
    calendarClassName?: string;
    popoverContentProps?: React.ComponentPropsWithoutRef<typeof PopoverContent>;
};

export default function DatePicker({
    value,
    onSelect,
    className,
    calendarClassName,
    popoverContentProps = {},
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const handleSelect = (selectedDate: Date | undefined): void => {
        if (onSelect && selectedDate) {
            onSelect(getNormalizedDate(selectedDate));
        }
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !value && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, 'PPP') : t('ui.select_date')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" {...popoverContentProps}>
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={handleSelect}
                    initialFocus
                    className={calendarClassName}
                />
            </PopoverContent>
        </Popover>
    );
}
