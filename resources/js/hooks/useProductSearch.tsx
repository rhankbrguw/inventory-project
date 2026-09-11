import { useState, useEffect } from 'react';
import axios from 'axios';

type ProductSearchItem = {
    id: number | string;
    name: string;
    sku: string;
};

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
            axios
                .get(`/api/products/search?query=${encodeURIComponent(query)}`, {
                    signal: controller.signal,
                })
                .then((res) => {
                    const searchResults = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
                    setOptions(searchResults as ProductSearchItem[]);
                })
                .catch((err) => {
                    if (!axios.isCancel(err)) setOptions([]);
                })
                .finally(() => setLoading(false));
        }, 200);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, open]);

    return { options, loading };
}
