import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Printer } from "lucide-react";

export default function PrintButton({
    children,
    className,
    variant = "outline",
    ...props
}) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <Button
            variant={variant}
            className={cn("print-hidden flex items-center gap-2", className)}
            onClick={handlePrint}
            {...props}
        >
            <Printer className="w-4 h-4" />
            {children}
        </Button>
    );
}
