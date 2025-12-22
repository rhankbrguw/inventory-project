import React from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { Package, TrendingUp } from "lucide-react";

export default function ReportMobileCard({ product, rank, compact = false }) {
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
                <div className="p-2 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 h-8 w-8">
                    <span className="text-xs font-bold">{rank}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                        {product.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{product.sku}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {formatNumber(product.quantity)} unit
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-success">
                        {formatCurrency(product.revenue)}
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Penjualan
                    </p>
                </div>
            </div>
        </Wrapper>
    );
}
