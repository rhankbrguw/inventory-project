import React, { useState, useEffect } from "react";
import {
    format,
    subDays,
    startOfMonth,
    endOfMonth,
    isSameYear,
} from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn, getNormalizedDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function SmartDateFilter({ filters, onFilterChange }) {
    const getInitialState = () => {
        const range = filters.date_range || "this_month";

        if (range === "custom" && filters.start_date && filters.end_date) {
            return {
                from: new Date(filters.start_date),
                to: new Date(filters.end_date),
            };
        }

        const today = new Date();
        if (range === "today") {
            return { from: today, to: today };
        }
        if (range === "last_7_days") {
            return { from: subDays(today, 6), to: today };
        }

        return {
            from: startOfMonth(today),
            to: endOfMonth(today),
        };
    };

    const [date, setDate] = useState(getInitialState());
    const [isOpen, setIsOpen] = useState(false);
    const [setIsDirty] = useState(false);

    useEffect(() => {
        setDate(getInitialState());
    }, [filters.date_range, filters.start_date, filters.end_date]);

    const presets = [
        {
            label: "Hari Ini",
            getValue: () => ({ from: new Date(), to: new Date() }),
            key: "today",
        },
        {
            label: "7 Hari Terakhir",
            getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }),
            key: "last_7_days",
        },
        {
            label: "Bulan Ini",
            getValue: () => ({
                from: startOfMonth(new Date()),
                to: endOfMonth(new Date()),
            }),
            key: "this_month",
        },
    ];

    const handlePresetClick = (preset) => {
        const newRange = preset.getValue();
        setDate(newRange);
        onFilterChange({
            date_range: preset.key,
            start_date: null,
            end_date: null,
        });
        setIsOpen(false);
        setIsDirty(false);
    };

    const handleCalendarSelect = (newDate) => {
        setDate(newDate);
        setIsDirty(true);
    };

    const applyCustomFilter = () => {
        if (date?.from) {
            const normalizedFrom = getNormalizedDate(date.from);
            const normalizedTo = date.to
                ? getNormalizedDate(date.to)
                : normalizedFrom;

            onFilterChange({
                date_range: "custom",
                start_date: format(normalizedFrom, "yyyy-MM-dd"),
                end_date: format(normalizedTo, "yyyy-MM-dd"),
            });
            setIsOpen(false);
            setIsDirty(false);
        }
    };

    const resetSelection = () => {
        setDate(undefined);
        setIsDirty(true);
    };

    const getDisplayLabel = () => {
        const today = new Date();

        if (filters.date_range === "today")
            return format(today, "d MMM", { locale: id });
        if (filters.date_range === "last_7_days") {
            const sevenDaysAgo = subDays(today, 6);
            return `${format(sevenDaysAgo, "d MMM", { locale: id })} - ${format(today, "d MMM", { locale: id })}`;
        }
        if (filters.date_range === "this_month")
            return format(today, "MMMM", { locale: id });

        if (date?.from) {
            if (!date.to) {
                return format(date.from, "d MMM yy", { locale: id });
            }

            const sameYear =
                isSameYear(date.from, today) && isSameYear(date.to, today);

            if (sameYear) {
                return `${format(date.from, "d MMM", { locale: id })} - ${format(date.to, "d MMM", { locale: id })}`;
            }
            return `${format(date.from, "d MMM yy", { locale: id })} - ${format(date.to, "d MMM yy", { locale: id })}`;
        }

        return "Pilih Periode";
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full md:w-[240px] h-9 px-3 font-normal justify-between",
                        !date && "text-muted-foreground",
                    )}
                >
                    <div className="flex items-center min-w-0 flex-1 overflow-hidden">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate text-xs sm:text-sm text-center w-full capitalize">
                            {getDisplayLabel()}
                        </span>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <div className="flex flex-col sm:flex-row">
                    {/* Sidebar Presets */}
                    <div className="border-b sm:border-b-0 sm:border-r py-2 w-full sm:w-[140px] bg-muted/10">
                        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-left">
                            Periode Cepat
                        </div>
                        <div className="flex flex-row sm:flex-col gap-1 px-2 overflow-x-auto sm:overflow-visible">
                            {presets.map((preset) => (
                                <Button
                                    key={preset.key}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "justify-center sm:justify-start text-[11px] sm:text-xs font-normal h-7 sm:h-8 whitespace-nowrap flex-shrink-0",
                                        filters.date_range === preset.key &&
                                        "bg-primary/10 text-primary font-medium",
                                    )}
                                    onClick={() => handlePresetClick(preset)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="p-0">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleCalendarSelect}
                            numberOfMonths={1}
                            locale={id}
                            className="p-2 sm:p-3"
                            captionLayout="dropdown-buttons"
                            fromYear={2020}
                            toYear={2030}
                        />

                        <div className="flex items-center justify-between p-3 border-t bg-muted/10">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetSelection}
                                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                            >
                                Reset
                            </Button>
                            <Button
                                size="sm"
                                onClick={applyCustomFilter}
                                disabled={!date?.from}
                                className="h-7 text-xs"
                            >
                                Terapkan
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
