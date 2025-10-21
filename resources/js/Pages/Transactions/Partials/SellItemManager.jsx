import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import ProductCombobox from "@/Components/ProductCombobox";
import CurrencyInput from "@/Components/CurrencyInput";
import InputError from "@/Components/InputError";
import StockAvailability from "@/Components/StockAvailability";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Label } from "@/Components/ui/label";

export default function SellItemManager({
    items,
    allProducts,
    setData,
    errors,
    locationId,
    itemsDisabled,
}) {
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === "product_id" && value) {
            const selectedProduct = allProducts.find((p) => p.id === value);
            newItems[index]["sell_price"] = selectedProduct?.price || "";
        }

        setData("items", newItems);
    };

    const addItem = () => {
        setData("items", [
            ...items,
            { product_id: null, quantity: "", sell_price: "" },
        ]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setData("items", newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => {
            const quantity = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.sell_price) || 0;
            return sum + quantity * price;
        }, 0);
    };

    const getSelectedProductIds = () => {
        return items.map((item) => item.product_id).filter((id) => id !== null);
    };

    const isAddItemDisabled =
        itemsDisabled ||
        !items[items.length - 1]?.product_id ||
        !items[items.length - 1]?.quantity ||
        !items[items.length - 1]?.sell_price;

    return (
        <Card className={cn(itemsDisabled && "opacity-50 pointer-events-none")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1.5">
                    <CardTitle>Item Penjualan</CardTitle>
                    <CardDescription>
                        Pilih produk untuk mengaktifkan field lain.
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
            <CardContent className="space-y-4 pt-4">
                {items.map((item, index) => {
                    const selectedProduct = allProducts.find(
                        (p) => p.id === item.product_id
                    );
                    const totalItem =
                        (parseFloat(item.quantity) || 0) *
                        (parseFloat(item.sell_price) || 0);

                    return (
                        <div
                            key={index}
                            className="border rounded-lg p-4 space-y-4"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={`product_${index}`}>
                                        Produk
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(index)}
                                        disabled={
                                            itemsDisabled || items.length <= 1
                                        }
                                        className="text-destructive hover:text-destructive h-8 w-8 md:hidden"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <ProductCombobox
                                    id={`product_${index}`}
                                    products={allProducts}
                                    value={item.product_id}
                                    onChange={(product) =>
                                        handleItemChange(
                                            index,
                                            "product_id",
                                            product.id
                                        )
                                    }
                                    error={errors[`items.${index}.product_id`]}
                                    disabledIds={getSelectedProductIds()}
                                    disabled={itemsDisabled}
                                />
                                {locationId &&
                                    item.product_id &&
                                    !itemsDisabled && (
                                        <StockAvailability
                                            productId={item.product_id}
                                            locationId={locationId}
                                            unit={selectedProduct?.unit}
                                        />
                                    )}
                                <InputError
                                    message={
                                        errors[`items.${index}.product_id`]
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`quantity_${index}`}>
                                        Jumlah
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id={`quantity_${index}`}
                                            type="number"
                                            step="any"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    "quantity",
                                                    e.target.value
                                                )
                                            }
                                            min="0.0001"
                                            required
                                            disabled={
                                                itemsDisabled ||
                                                !item.product_id
                                            }
                                            placeholder="0"
                                            className={
                                                selectedProduct ? "pr-12" : ""
                                            }
                                        />
                                        {selectedProduct && (
                                            <span className="absolute inset-y-0 right-0 top-0 flex items-center pr-3 text-sm text-muted-foreground pointer-events-none">
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

                                <div className="space-y-2">
                                    <Label htmlFor={`sell_price_${index}`}>
                                        Harga Jual
                                    </Label>
                                    <CurrencyInput
                                        id={`sell_price_${index}`}
                                        value={item.sell_price}
                                        onValueChange={(value) =>
                                            handleItemChange(
                                                index,
                                                "sell_price",
                                                value
                                            )
                                        }
                                        required
                                        disabled={
                                            itemsDisabled || !item.product_id
                                        }
                                        placeholder="Rp"
                                    />
                                    <InputError
                                        message={
                                            errors[`items.${index}.sell_price`]
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t mt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(index)}
                                    disabled={
                                        itemsDisabled || items.length <= 1
                                    }
                                    className="hidden md:flex text-destructive hover:text-destructive h-8 px-2"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    <span className="text-xs">Hapus Item</span>
                                </Button>
                                <div className="flex items-baseline gap-2 md:ml-auto">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Total Item:
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {formatCurrency(totalItem)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <InputError message={errors.items} className="mt-2" />
            </CardContent>
        </Card>
    );
}
