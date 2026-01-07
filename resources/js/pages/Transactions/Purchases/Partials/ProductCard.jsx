import { cn, formatCurrency } from '@/lib/utils';
import { Check } from 'lucide-react';

export default function ProductCard({
    product,
    onClick,
    selected,
    processing,
    showPrice = true,
}) {
    const imageUrl = product.image_path
        ? `/storage/${product.image_path}`
        : 'https://placehold.co/300x300/f1f5f9/a3a3a3?text=No+Image';

    const handleClick = () => {
        if (!processing) {
            onClick();
        }
    };

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !processing) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={processing ? -1 : 0}
            aria-pressed={selected}
            aria-busy={processing}
            className={cn(
                'relative overflow-hidden rounded-lg border bg-card transition-all',
                'cursor-pointer focus:outline-none',
                selected
                    ? 'border-primary ring-2 ring-primary shadow-md'
                    : 'border-border hover:border-primary/50 hover:shadow-sm',
                processing && 'opacity-50 cursor-wait'
            )}
        >
            {processing && (
                <div
                    className="absolute inset-0 z-10 flex items-center justify-center bg-background/80"
                    aria-hidden="true"
                >
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            <div className="relative aspect-square w-full overflow-hidden bg-muted">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src =
                            'https://placehold.co/300x300/f1f5f9/a3a3a3?text=No+Image';
                    }}
                    loading="lazy"
                />

                {selected && (
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-primary/10"
                        aria-hidden="true"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-lg">
                            <Check
                                className="h-4 w-4 text-primary-foreground"
                                strokeWidth={2.5}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-1 p-2.5">
                <h3 className="truncate text-[13px] font-semibold text-foreground leading-tight">
                    {product.name}
                </h3>
                <p className="text-[11px] text-muted-foreground truncate">
                    {product.sku || '—'}
                </p>
                {showPrice && (
                    <p className="text-[15px] font-bold text-foreground pt-0.5">
                        {formatCurrency(product.price)}
                    </p>
                )}
            </div>
        </div>
    );
}
