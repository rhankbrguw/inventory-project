import React from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Check } from "lucide-react";

export default function ProductCard({
    product,
    onClick,
    selected,
    processing,
}) {
    const imageUrl = product.image_path
        ? `/storage/${product.image_path}`
        : "https://placehold.co/300x300/f1f5f9/a3a3a3?text=No+Image";

    return (
        <div
            onClick={!processing ? onClick : undefined}
            className={cn(
                "group rounded-lg border bg-card overflow-hidden transition-all relative",
                selected
                    ? "ring-2 ring-primary border-primary shadow-sm"
                    : "border-border hover:border-primary/50 hover:shadow-sm",
                processing ? "opacity-60 cursor-wait" : "cursor-pointer",
            )}
        >
            {processing && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            <div className="aspect-square w-full bg-muted/30 relative overflow-hidden">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src =
                            "https://placehold.co/300x300/f1f5f9/a3a3a3?text=No+Image";
                    }}
                    loading="lazy"
                />
                {selected && (
                    <div className="absolute inset-0 bg-primary/15 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-primary shadow-md flex items-center justify-center">
                            <Check
                                className="w-4 h-4 text-primary-foreground"
                                strokeWidth={2.5}
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className="p-1.5 space-y-0.5 bg-card">
                <p className="font-semibold text-[11px] leading-tight line-clamp-1 text-foreground">
                    {product.name}
                </p>
                <p className="text-[9px] text-muted-foreground font-mono leading-tight truncate">
                    {product.sku}
                </p>
                <p className="text-xs font-bold text-primary pt-0.5">
                    {formatCurrency(product.price)}
                </p>
            </div>
        </div>
    );
}
