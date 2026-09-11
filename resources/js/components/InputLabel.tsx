import type * as React from 'react';

type InputLabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
    value?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
};

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: InputLabelProps) {
    return (
        <label
            {...props}
            className={`block font-medium text-sm text-foreground ` + className}
        >
            {value ? value : children}
        </label>
    );
}
