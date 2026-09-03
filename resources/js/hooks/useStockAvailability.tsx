import { useState, useEffect } from 'react';
import axios from 'axios';

type StockAvailabilityState = {
    quantity: number | null;
    loading: boolean;
};

export function useStockAvailability(productId?: number | string, locationId?: number | string): StockAvailabilityState {
    const [quantity, setQuantity] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!productId || !locationId) {
            setQuantity(null);
            return;
        }

        setLoading(true);
        axios
            .get(route('api.inventory.quantity', { product_id: productId, location_id: locationId }))
            .then((res) => {
                const qty = res.data?.data?.quantity ?? res.data?.quantity ?? 0;
                setQuantity(Number(qty));
            })
            .catch(() => {
                setQuantity(0);
            })
            .finally(() => setLoading(false));
    }, [productId, locationId]);

    return { quantity, loading };
}
