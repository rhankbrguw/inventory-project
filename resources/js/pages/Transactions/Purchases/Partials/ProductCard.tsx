import { cn, formatCurrency } from '@/lib/utils';
import { Check, ImageIcon } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({
    product,
    price,
    onClick,
    selected,
    showPrice = true,
    processing: _processing,
    ...rest
}: {
    product: any;
    price?: any;
    onClick: any;
    selected: any;
    showPrice?: boolean;
    processing?: boolean;
    [key: string]: unknown;
}) {
    const [imgError, setImgError] = useState(false);
    const displayPrice = price !== undefined && price !== null ? price : product.price;
    const imageUrl = product.image_path ? `/storage/${product.image_path}` : null;

    const handleClick = () => {
        onClick();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            className={cn(
                'relative overflow-hidden rounded-lg border bg-card transition-all select-none',
                'cursor-pointer active:scale-95 duration-75',
                selected
                    ? 'border-primary ring-2 ring-primary shadow-md'
                    : 'border-border hover:border-primary/50 hover:shadow-sm'
            )}
        >
            <div className="relative aspect-square w-full overflow-hidden bg-muted flex items-center justify-center">
                {imageUrl && !imgError ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover pointer-events-none"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
                )}

                {selected && (
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-primary/15"
                        aria-hidden="true"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-lg scale-100 animate-in fade-in zoom-in-75 duration-100">
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
                        {formatCurrency(displayPrice)}
                    </p>
                )}
            </div>
        </div>
    );
}
