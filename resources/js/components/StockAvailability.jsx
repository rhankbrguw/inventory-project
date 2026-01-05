import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatNumber, cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function StockAvailability({ productId, locationId, unit }) {
    const [stock, setStock] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (productId && locationId) {
            setLoading(true);
            setStock(null);
            axios
                .get(
                    route('api.inventory.quantity', {
                        product_id: productId,
                        location_id: locationId,
                    })
                )
                .then((response) => setStock(response.data.quantity ?? 0))
                .catch(() => setStock(0))
                .finally(() => setLoading(false));
        } else {
            setStock(null);
        }
    }, [productId, locationId]);

    if (loading) {
        return (
            <p className="text-xs text-muted-foreground mt-1">Memuat stok...</p>
        );
    }

    if (stock !== null) {
        const isAvailable = stock > 0;
        return (
            <p
                className={cn(
                    'text-xs mt-1 flex items-center gap-1',
                    isAvailable ? 'text-muted-foreground' : 'text-destructive'
                )}
            >
                {isAvailable ? (
                    <CheckCircle2 size={12} />
                ) : (
                    <AlertCircle size={12} />
                )}
                Stok tersedia: {formatNumber(stock)} {unit}
            </p>
        );
    }

    return null;
}
