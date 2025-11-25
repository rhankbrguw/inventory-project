import React from "react";
import { Card } from "@/components/ui/card";
import { formatNumber, formatDate, cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function DashboardMobileCard({ movement, compact = false }) {
    const isPositive = movement.quantity > 0;

    const Wrapper = compact ? "div" : Card;
    const wrapperClasses = compact
        ? "border-b last:border-0 pb-3 last:pb-0"
        : "hover:bg-muted/20 transition-colors mb-2";

    return (
        <Wrapper className={wrapperClasses}>
            <div
                className={cn(
                    "flex flex-row items-center gap-3",
                    !compact && "p-3",
                )}
            >
                <div
                    className={cn(
                        "p-2 rounded-lg flex items-center justify-center flex-shrink-0 h-8 w-8",
                        isPositive
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive",
                    )}
                >
                    {isPositive ? (
                        <ArrowUpRight className="h-4 w-4" />
                    ) : (
                        <ArrowDownLeft className="h-4 w-4" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                        {movement.product?.name || "Produk Dihapus"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize text-foreground/80 font-medium">
                            {movement.type.replace("_", " ")}
                        </span>
                        <span>•</span>
                        <span>{formatDate(movement.created_at)}</span>
                    </div>
                </div>

                <div className="text-right">
                    <div
                        className={cn(
                            "text-sm font-bold",
                            isPositive ? "text-success" : "text-destructive",
                        )}
                    >
                        {isPositive ? "+" : ""}
                        {formatNumber(movement.quantity)}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        {movement.product?.unit || "unit"}
                    </p>
                </div>
            </div>
        </Wrapper>
    );
}
