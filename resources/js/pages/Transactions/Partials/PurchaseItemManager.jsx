import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import CurrencyInput from "@/components/CurrencyInput";
import InputError from "@/components/InputError";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

export default function PurchaseItemManager({
    items,
    suppliers,
    handleItemChange,
    removeItem,
    errors,
}) {
    if (items.length === 0) {
        return (
            <div className="border-t-2 pt-4">
                <h3 className="text-base font-bold mb-1 text-gray-900">
                    Daftar Item Pembelian
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                    Pilih produk dari daftar untuk menambahkan item
                </p>
                <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/30 to-muted/10 text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm mx-auto mb-3 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-muted-foreground/40"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                        Belum ada item dipilih
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Klik pada produk untuk menambahkan
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="border-t-2 pt-4 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-gray-900">
                        Daftar Item Pembelian
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {items.length} item dipilih
                    </p>
                </div>
            </div>

            <div className="space-y-2.5">
                {items.map((item, index) => {
                    const totalItem =
                        (item.quantity || 0) * (item.cost_per_unit || 0);

                    return (
                        <div
                            key={index}
                            className="rounded-xl border-2 bg-white shadow-sm p-3.5 space-y-3 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm leading-tight truncate text-gray-900">
                                        {item.name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Satuan:{" "}
                                        <span className="font-medium">
                                            {item.unit}
                                        </span>
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 rounded-lg"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700">
                                        Jumlah
                                    </Label>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleItemChange(
                                                index,
                                                "quantity",
                                                e.target.value,
                                            )
                                        }
                                        min="1"
                                        className="h-9 text-sm border-2 focus-visible:ring-2"
                                    />
                                    <InputError
                                        message={
                                            errors[`items.${index}.quantity`]
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700">
                                        Harga Beli
                                    </Label>
                                    <CurrencyInput
                                        value={item.cost_per_unit}
                                        onValueChange={(value) =>
                                            handleItemChange(
                                                index,
                                                "cost_per_unit",
                                                value,
                                            )
                                        }
                                        className="h-9 text-sm border-2 focus-visible:ring-2"
                                    />
                                    <InputError
                                        message={
                                            errors[
                                                `items.${index}.cost_per_unit`
                                            ]
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-700">
                                    Supplier
                                </Label>
                                <Select
                                    value={item.supplier_id}
                                    onValueChange={(value) =>
                                        handleItemChange(
                                            index,
                                            "supplier_id",
                                            value,
                                        )
                                    }
                                    disabled={index > 0}
                                >
                                    <SelectTrigger className="h-9 text-sm border-2 focus:ring-2">
                                        <SelectValue placeholder="Pilih supplier" />
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
                            </div>

                            <div className="flex justify-between items-center pt-2.5 border-t-2">
                                <span className="text-xs text-muted-foreground font-semibold">
                                    Subtotal Item
                                </span>
                                <span className="text-base font-bold text-primary">
                                    {formatCurrency(totalItem)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
