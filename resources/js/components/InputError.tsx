import type React from 'react';

type InputErrorProps = React.HTMLAttributes<HTMLParagraphElement> & {
    message?: string | string[];
};

export default function InputError({
    message,
    className = '',
    ...props
}: InputErrorProps) {
    if (!message) {
        return null;
    }

    const text = Array.isArray(message) ? message[0] : message;

    return (
        <p
            {...props}
            className={`text-xs font-medium text-destructive mt-1.5 animate-in fade-in-50 duration-200 ${className}`}
        >
            {text}
        </p>
    );
}
