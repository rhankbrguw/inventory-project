import { useState, useEffect } from 'react';
import axios from 'axios';

type ProductSearchItem = {
    id: number | string;
    name: string;
    sku: string;
};

async function fetchProductSuggestions(
    query: string,
    signal: AbortSignal,
    setOptions: (items: ProductSearchItem[]) => void,
    setLoading: (loading: boolean) => void
) {
    try {
        const res = await axios.get(`/api/products/search?query=${encodeURIComponent(query)}`, { signal });
        const results = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setOptions(results as ProductSearchItem[]);
    } catch (err) {
        if (!axios.isCancel(err)) setOptions([]);
    } finally {
        setLoading(false);
    }
}

export function useProductSearch(query: string, open: boolean) {
    const [options, setOptions] = useState<ProductSearchItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !query || query.length < 2) {
            setOptions([]);
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        const timer = setTimeout(() => {
            fetchProductSuggestions(query, controller.signal, setOptions, setLoading);
        }, 200);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, open]);

    return { options, loading };
}
