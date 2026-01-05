import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const InputWithPrefix = React.forwardRef(
    ({ className, prefix, ...props }, ref) => {
        return (
            <div className="relative w-full">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-medium z-10 select-none">
                    {prefix}
                </div>

                <Input
                    className={cn('pl-12', className)}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
InputWithPrefix.displayName = 'InputWithPrefix';

export { InputWithPrefix };
