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
import CurrencyInput from "@/Components/CurrencyInput";
import InputError from "@/Components/InputError";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { formatCurrency } from "@/lib/utils";

export default function PurchaseItemManager({
    items,
    products,
    suppliers,
    setData,
    errors,
    selectedProductIds,
}) {
    const handleItemChange = (index, field, value) => {
        let updatedItems = [...items];
        updatedItems[index][field] = value;

        if (index === 0 && field === "supplier_id") {
            updatedItems = updatedItems.map((item, i) => {
                if (i > 0) {
                    return { ...item, supplier_id: value };
                }
                return item;
            });
        }

        setData("items", updatedItems);
    };

    const handleProductSelect = (index, product) => {
        const updatedItems = [...items];
        updatedItems[index] = {
            ...updatedItems[index],
            product_id: product.id,
            cost_per_unit: product.price || "",
            supplier_id:
                product.default_supplier?.id?.toString() ||
                updatedItems[index].supplier_id ||
                null,
        };
        setData("items", updatedItems);
    };

    const addItem = () => {
        const firstItemSupplier =
            items.length > 0 ? items[0].supplier_id : null;
        setData("items", [
            ...items,
            {
                product_id: "",
                supplier_id: firstItemSupplier,
                quantity: 1,
                cost_per_unit: "",
            },
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
                    <CardTitle>Item Pembelian</CardTitle>
                    <CardDescription>
                        Pilih produk terlebih dahulu untuk mengaktifkan field
                        lain.
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
                    const totalItem =
                        (item.quantity || 0) * (item.cost_per_unit || 0);

                    const availableProducts = item.supplier_id
                        ? products.filter(
                              (p) => p.default_supplier?.id == item.supplier_id
                          )
                        : products;

                    return (
                        <div
                            key={index}
                            className="border rounded-lg p-4 space-y-4"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Produk</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(index)}
                                        disabled={items.length <= 1}
                                        className="lg:hidden text-destructive hover:text-destructive h-8 w-8"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    <ProductCombobox
                                        products={availableProducts}
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
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label>Jumlah</Label>
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
                                <div className="space-y-1">
                                    <Label>Harga Beli</Label>
                                    <CurrencyInput
                                        value={item.cost_per_unit}
                                        onValueChange={(value) =>
                                            handleItemChange(
                                                index,
                                                "cost_per_unit",
                                                value
                                            )
                                        }
                                        placeholder="Harga"
                                        disabled={!selectedProduct}
                                    />
                                    <InputError
                                        message={
                                            errors[
                                                `items.${index}.cost_per_unit`
                                            ]
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Supplier</Label>
                                    <Select
                                        value={item.supplier_id}
                                        onValueChange={(value) =>
                                            handleItemChange(
                                                index,
                                                "supplier_id",
                                                value
                                            )
                                        }
                                        disabled={!selectedProduct || index > 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih supplier..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((supplier) => (
                                                <SelectItem
                                                    key={supplier.id}
                                                    value={supplier.id.toString()}
                                                >
                                                    {supplier.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={
                                            errors[`items.${index}.supplier_id`]
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(index)}
                                    disabled={items.length <= 1}
                                    className="hidden lg:flex text-destructive hover:text-destructive h-8 px-2"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    <span className="text-xs">Hapus Item</span>
                                </Button>
                                <div className="flex items-baseline gap-2 lg:ml-auto">
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
            </CardContent>
        </Card>
    );
}
