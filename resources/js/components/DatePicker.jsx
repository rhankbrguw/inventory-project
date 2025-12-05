import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

export default function DatePicker({
    value,
    onSelect,
    className,
    calendarClassName,
    popoverContentProps = {},
}) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (selectedDate) => {
        if (onSelect && selectedDate) {
            const normalizedDate = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                12,
                0,
                0,
                0,
            );
            onSelect(normalizedDate);
        }
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className,
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "PPP") : <span>Pilih tanggal</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn("w-auto p-0", popoverContentProps.className)}
                align="start"
                sideOffset={4}
                {...popoverContentProps}
            >
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
