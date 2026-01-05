import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function CurrencyInput({
    value: propValue,
    onValueChange,
    className,
    disabled,
    ...props
}) {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (!isFocused) {
            setDisplayValue(formatToUser(propValue));
        }
    }, [propValue, isFocused]);

    const formatToUser = (val) => {
        if (val === null || val === '' || val === undefined) {
            return '';
        }
        const num = Number(val);
        if (isNaN(num) || num === 0) {
            return '';
        }
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const cleanInput = (val) => {
        return val.replace(/[^\d]/g, '');
    };

    const handleFocus = (e) => {
        setIsFocused(true);
        const rawValue = cleanInput(displayValue);
        setDisplayValue(rawValue);
        setTimeout(() => e.target.select(), 0);
    };

    const handleChange = (e) => {
        const inputValue = e.target.value;
        const cleanedValue = cleanInput(inputValue);

        if (cleanedValue === '' || /^\d+$/.test(cleanedValue)) {
            setDisplayValue(cleanedValue);
            onValueChange(cleanedValue || '0');
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        const cleanedValue = cleanInput(displayValue);
        const numValue = Number(cleanedValue);

        if (isNaN(numValue) || numValue <= 0) {
            onValueChange('0');
            setDisplayValue('');
        } else {
            onValueChange(cleanedValue);
            setDisplayValue(formatToUser(cleanedValue));
        }
    };

    return (
        <Input
            {...props}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(className)}
            autoComplete="off"
            placeholder="0"
        />
    );
}
