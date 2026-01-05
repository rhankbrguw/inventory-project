export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-4 py-2 bg-destructive border border-transparent rounded-md font-semibold text-xs text-destructive-foreground uppercase tracking-widest hover:bg-destructive/90 active:bg-destructive/80 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 transition ease-in-out duration-150 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
