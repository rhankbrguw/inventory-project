import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = React.forwardRef(({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <Input
                type={showPassword ? "text" : "password"}
                className={cn("pr-10", className)}
                ref={ref}
                {...props}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword((prev) => !prev)}
            >
                {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">
                    {showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"}
                </span>
            </Button>
        </div>
    );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
