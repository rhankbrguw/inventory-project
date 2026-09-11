import type * as React from 'react';

type PrimaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
};

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: PrimaryButtonProps) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-md font-semibold text-xs text-primary-foreground uppercase tracking-widest hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition ease-in-out duration-150 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
