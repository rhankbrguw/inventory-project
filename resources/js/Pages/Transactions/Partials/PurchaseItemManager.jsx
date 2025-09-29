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

export default function PurchaseItemManager({
    items,
    products,
    suppliers,
    setData,
    errors,
}) {
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        setData("items", updatedItems);
    };

    const handleProductSelect = (index, product) => {
        const updatedItems = [...items];
        updatedItems[index] = {
            ...updatedItems[index],
            product_id: product.id,
            cost_per_unit: product.price || "",
            supplier_id: product.default_supplier?.id?.toString() || null,
        };
        setData("items", updatedItems);
    };

    const addItem = () => {
        setData("items", [
            ...items,
            {
                product_id: "",
                supplier_id: null,
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

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1.5">
                    <CardTitle>Item Pembelian</CardTitle>
                    <CardDescription>
                        Isi item yang akan dibeli.
                    </CardDescription>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="flex items-center gap-2 shrink-0"
                >
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden md:inline">Tambah Item</span>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="hidden md:grid md:grid-cols-12 md:gap-x-4 text-sm font-medium text-muted-foreground px-1">
                    <Label className="md:col-span-4 text-center">Produk</Label>
                    <Label className="md:col-span-2 text-center">Jumlah</Label>
                    <Label className="md:col-span-2 text-center">
                        Harga Beli
                    </Label>
                    <Label className="md:col-span-3 text-center">
                        Supplier
                    </Label>
                </div>
                {items.map((item, index) => {
                    const selectedProduct = products.find(
                        (p) => p.id === item.product_id
                    );
                    return (
                        <div
                            key={index}
                            className="border rounded-lg p-4 space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-x-4 md:items-center"
                        >
                            <div className="md:col-span-4 space-y-1">
                                <Label className="md:hidden">Produk</Label>
                                <ProductCombobox
                                    products={products}
                                    value={item.product_id}
                                    onChange={(product) =>
                                        handleProductSelect(index, product)
                                    }
                                />
                                <InputError
                                    message={
                                        errors[`items.${index}.product_id`]
                                    }
                                />
                            </div>

                            <div className="md:col-span-2 space-y-1 md:flex md:flex-col md:items-center">
                                <Label className="md:hidden">Jumlah</Label>
                                <div className="relative w-full">
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
                                        className={
                                            selectedProduct
                                                ? "pr-12 md:text-center"
                                                : "md:text-center"
                                        }
                                    />
                                    {selectedProduct && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground pointer-events-none">
                                            {selectedProduct.unit}
                                        </span>
                                    )}
                                </div>
                                <InputError
                                    message={errors[`items.${index}.quantity`]}
                                />
                            </div>

                            <div className="md:col-span-2 space-y-1 md:flex md:flex-col md:items-center">
                                <Label className="md:hidden">
                                    Harga Beli / Satuan
                                </Label>
                                <div className="w-full">
                                    <CurrencyInput
                                        value={item.cost_per_unit}
                                        onValueChange={(value) =>
                                            handleItemChange(
                                                index,
                                                "cost_per_unit",
                                                value
                                            )
                                        }
                                        placeholder="Cost per unit"
                                        className="text-left"
                                    />
                                </div>
                                <InputError
                                    message={
                                        errors[`items.${index}.cost_per_unit`]
                                    }
                                />
                            </div>

                            <div className="md:col-span-3 space-y-1 md:flex md:flex-col md:items-center">
                                <Label className="md:hidden">Supplier</Label>
                                <div className="w-full">
                                    <Select
                                        value={item.supplier_id}
                                        onValueChange={(value) =>
                                            handleItemChange(
                                                index,
                                                "supplier_id",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih supplier..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={null}>
                                                Tanpa Supplier
                                            </SelectItem>
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
                                </div>
                                <InputError
                                    message={
                                        errors[`items.${index}.supplier_id`]
                                    }
                                />
                            </div>

                            <div className="md:col-span-1 flex items-center justify-end md:justify-center">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    disabled={items.length <= 1}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
