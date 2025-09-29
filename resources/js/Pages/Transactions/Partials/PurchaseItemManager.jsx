import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import FormField from "@/Components/FormField";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import ProductCombobox from "@/Components/ProductCombobox";

export default function PurchaseItemManager({
    items,
    products,
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
        updatedItems[index].product_id = product.id;
        updatedItems[index].cost_per_unit = product.price || "";

        const updatePayload = { items: updatedItems };

        if (product.default_supplier_id) {
            updatePayload.supplier_id = product.default_supplier_id.toString();
        }

        setData((data) => ({
            ...data,
            ...updatePayload,
        }));
    };

    const addItem = () => {
        setData("items", [
            ...items,
            { product_id: "", quantity: 1, cost_per_unit: "" },
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
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Item Pembelian</CardTitle>
                    <CardDescription>
                        Pilih produk dan masukan jumlah.
                    </CardDescription>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="flex items-center justify-center w-10 h-10 rounded-full sm:w-auto sm:h-auto sm:rounded-md sm:px-4 sm:py-2 gap-2"
                >
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Item</span>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_120px_180px_auto] gap-x-4 gap-y-2 items-end p-4 border rounded-lg"
                    >
                        <FormField
                            label="Produk"
                            htmlFor={`product-${index}`}
                            error={errors[`items.${index}.product_id`]}
                            className="w-full"
                        >
                            <ProductCombobox
                                products={products}
                                value={item.product_id}
                                onChange={(product) =>
                                    handleProductSelect(index, product)
                                }
                            />
                        </FormField>
                        <FormField
                            label="Jumlah"
                            htmlFor={`quantity-${index}`}
                            error={errors[`items.${index}.quantity`]}
                            className="w-full"
                        >
                            <Input
                                id={`quantity-${index}`}
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
                            />
                        </FormField>
                        <FormField
                            label="Harga Beli / Satuan"
                            htmlFor={`cost-${index}`}
                            error={errors[`items.${index}.cost_per_unit`]}
                            className="w-full"
                        >
                            <Input
                                id={`cost-${index}`}
                                type="number"
                                value={item.cost_per_unit}
                                onChange={(e) =>
                                    handleItemChange(
                                        index,
                                        "cost_per_unit",
                                        e.target.value
                                    )
                                }
                                placeholder="Harga Beli"
                                min="0"
                            />
                        </FormField>
                        <div>
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
                ))}
            </CardContent>
        </Card>
    );
}
