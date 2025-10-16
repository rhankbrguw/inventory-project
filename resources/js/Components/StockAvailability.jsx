import { useEffect, useState } from "react";
import axios from "axios";
import { formatNumber } from "@/lib/utils";

export default function StockAvailability({ productId, locationId, unit }) {
    const [stock, setStock] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (productId && locationId) {
            setLoading(true);
            axios
                .get(
                    route("api.inventory.quantity", {
                        product_id: productId,
                        location_id: locationId,
                    })
                )
                .then((response) => setStock(response.data.quantity))
                .catch(() => setStock(0))
                .finally(() => setLoading(false));
        } else {
            setStock(null);
        }
    }, [productId, locationId]);

    if (loading) {
        return <p className="text-xs text-muted-foreground">Memuat stok...</p>;
    }

    if (stock !== null) {
        return (
            <p className="text-xs text-muted-foreground">
                Stok tersedia: {formatNumber(stock)} {unit}
            </p>
        );
    }

    return null;
}
