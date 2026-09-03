import { forwardRef, useEffect, useRef } from 'react';

type TextInputProps = React.ComponentPropsWithoutRef<'input'> & {
    isFocused?: boolean;
};

export default forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref
) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isFocused) {
            inputRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ' +
                className
            }
            ref={ref ?? inputRef}
        />
    );
});
