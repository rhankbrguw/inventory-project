import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function CurrencyInput({
    value: propValue,
    onValueChange,
    className,
    ...props
}) {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
        setDisplayValue(formatToUser(propValue));
    }, [propValue]);

    const formatToUser = (val) => {
        if (val === null || val === "" || isNaN(Number(val))) {
            return "";
        }
        return new Intl.NumberFormat("id-ID").format(Number(val));
    };

    const cleanInput = (val) => {
        return val.replace(/[^\d]/g, "");
    };

    const handleChange = (e) => {
        const cleanedValue = cleanInput(e.target.value);
        setDisplayValue(formatToUser(cleanedValue));
        onValueChange(cleanedValue);
    };

    const handleBlur = () => {
        setDisplayValue(formatToUser(propValue));
    };

    return (
        <Input
            {...props}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(className)}
        />
    );
}
