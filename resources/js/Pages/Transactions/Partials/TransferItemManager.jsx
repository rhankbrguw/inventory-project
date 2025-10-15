import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import ProductCombobox from "@/Components/ProductCombobox";
import InputError from "@/Components/InputError";
import { Label } from "@/Components/ui/label";
import { useEffect, useState } from "react";
import axios from "axios";
import { formatNumber } from "@/lib/utils";

const StockAvailability = ({ productId, locationId, unit }) => {
    const [stock, setStock] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (productId && locationId) {
            setLoading(true);
            axios.get(route("api.inventory.quantity", { product_id: productId, location_id: locationId }))
                .then(response => setStock(response.data.quantity))
                .catch(() => setStock(0))
                .finally(() => setLoading(false));
        } else {
            setStock(null);
        }
    }, [productId, locationId]);

    if (loading) {
        return <p className="text-xs text-muted-foreground mt-1">Memuat stok...</p>;
    }

    if (stock !== null) {
        return <p className="text-xs text-muted-foreground mt-1">Stok tersedia: {formatNumber(stock)} {unit}</p>;
    }

    return null;
};

export default function TransferItemManager({
    items,
    products,
    setData,
    errors,
    selectedProductIds,
    fromLocationId,
}) {
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setData("items", newItems);
    };

    const handleProductSelect = (index, product) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            product_id: product.id,
            unit: product.unit,
        };
        setData("items", newItems);
    };

    const addItem = () => {
        setData("items", [
            ...items,
            { product_id: "", quantity: 1, unit: "" },
        ]);
    };

    const removeItem = (index) => {
        setData(
            "items",
            items.filter((_, i) => i !== index)
        );
    };

    const isAddItemDisabled = !items[items.length - 1]?.product_id;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1.5">
                    <CardTitle>Item Transfer</CardTitle>
                    <CardDescription>
                        Pilih produk yang akan ditransfer antar lokasi.
                    </CardDescription>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="flex items-center gap-2 shrink-0"
                    disabled={isAddItemDisabled}
                >
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden md:inline">Tambah Item</span>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item, index) => {
                    const selectedProduct = products.find(
                        (p) => p.id === item.product_id
                    );

                    return (
                        <div
                            key={index}
                            className="border rounded-lg p-4 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <Label>Produk #{index + 1}</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    disabled={items.length <= 1}
                                    className="text-destructive hover:text-destructive h-8 w-8"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                                <div className="space-y-1">
                                    <ProductCombobox
                                        products={products}
                                        value={item.product_id}
                                        onChange={(product) =>
                                            handleProductSelect(index, product)
                                        }
                                        disabledIds={selectedProductIds}
                                    />
                                    <InputError
                                        message={
                                            errors[`items.${index}.product_id`]
                                        }
                                    />
                                    <StockAvailability
                                        productId={item.product_id}
                                        locationId={fromLocationId}
                                        unit={selectedProduct?.unit}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    "quantity",
                                                    e.target.value
                                                )
                                            }
                                            min="1"
                                            placeholder="Jumlah"
                                            disabled={!selectedProduct}
                                            className={
                                                selectedProduct ? "pr-12" : ""
                                            }
                                        />
                                        {selectedProduct && (
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground pointer-events-none">
                                                {selectedProduct.unit}
                                            </span>
                                        )}
                                    </div>
                                    <InputError
                                        message={
                                            errors[`items.${index}.quantity`]
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
