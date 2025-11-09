import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const InputWithPrefix = React.forwardRef(
    ({ className, prefix, ...props }, ref) => {
        return (
            <div className={cn("relative flex items-center", className)}>
                <span className="absolute left-3 text-sm text-muted-foreground pointer-events-none">
                    {prefix}
                </span>
                <Input
                    {...props}
                    ref={ref}
                    className={cn("pl-10", props.className)}
                />
            </div>
        );
    },
);
InputWithPrefix.displayName = "InputWithPrefix";

export { InputWithPrefix };
