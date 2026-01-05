import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`w-full flex items-start ps-3 pe-4 py-2 border-l-4 ${
                active
                    ? 'border-primary text-primary bg-primary/10 focus:text-primary focus:bg-primary/10 focus:border-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border focus:text-foreground focus:bg-accent focus:border-border'
            } text-base font-medium focus:outline-none transition duration-150 ease-in-out ${className}`}
        >
            {children}
        </Link>
    );
}
