import type * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Printer } from 'lucide-react';

type PrintButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
    children?: React.ReactNode;
    className?: string;
};

export default function PrintButton({
    children,
    className,
    variant = 'outline',
    ...props
}: PrintButtonProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <Button
            variant={variant}
            className={cn('print-hidden flex items-center gap-2', className)}
            onClick={handlePrint}
            {...props}
        >
            <Printer className="w-4 h-4" />
            {children}
        </Button>
    );
}
