import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import InputError from "@/Components/InputError";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ProductCombobox = ({ products, value, onChange, error }) => {
    const [open, setOpen] = useState(false);
    const selectedProduct = products.find((p) => p.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {selectedProduct
                        ? `${selectedProduct.name} (${selectedProduct.sku})`
                        : "Pilih produk..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            {error && <InputError message={error} className="mt-1" />}
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Cari produk atau SKU..." />
                    <CommandList>
                        <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                            {products.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={`${product.name} ${product.sku}`}
                                    onSelect={() => {
                                        onChange(product.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === product.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    <div>
                                        <p>{product.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            SKU: {product.sku}
                                        </p>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default function Create({ auth, locations, suppliers, products }) {
    const { data, setData, post, processing, errors } = useForm({
        location_id: "",
        supplier_id: "",
        transaction_date: new Date().toISOString().slice(0, 10),
        notes: "",
        items: [{ product_id: "", quantity: 1, cost_per_unit: "" }],
    });

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...data.items];
        updatedItems[index][field] = value;
        setData("items", updatedItems);
    };

    const addItem = () => {
        setData("items", [
            ...data.items,
            { product_id: "", quantity: 1, cost_per_unit: "" },
        ]);
    };

    const removeItem = (index) => {
        setData(
            "items",
            data.items.filter((_, i) => i !== index)
        );
    };

    const calculateTotal = () => {
        return data.items.reduce((total, item) => {
            return total + Number(item.quantity) * Number(item.cost_per_unit);
        }, 0);
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);

    const submit = (e) => {
        e.preventDefault();
        post(route("transactions.purchases.store"));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Buat Transaksi Pembelian" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route("transactions.index")}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Buat Transaksi Pembelian
                    </h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Transaksi</CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="location_id">
                                    Lokasi Penerima
                                </Label>
                                <Select
                                    value={data.location_id}
                                    onValueChange={(value) =>
                                        setData("location_id", value)
                                    }
                                >
                                    <SelectTrigger id="location_id">
                                        <SelectValue placeholder="Pilih lokasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map((loc) => (
                                            <SelectItem
                                                key={loc.id}
                                                value={loc.id.toString()}
                                            >
                                                {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.location_id} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="supplier_id">Supplier</Label>
                                <Select
                                    value={data.supplier_id}
                                    onValueChange={(value) =>
                                        setData("supplier_id", value)
                                    }
                                >
                                    <SelectTrigger id="supplier_id">
                                        <SelectValue placeholder="Pilih supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((sup) => (
                                            <SelectItem
                                                key={sup.id}
                                                value={sup.id.toString()}
                                            >
                                                {sup.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.supplier_id} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="transaction_date">
                                    Tanggal Transaksi
                                </Label>
                                <Input
                                    id="transaction_date"
                                    type="date"
                                    value={data.transaction_date}
                                    onChange={(e) =>
                                        setData(
                                            "transaction_date",
                                            e.target.value
                                        )
                                    }
                                />
                                <InputError message={errors.transaction_date} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="notes">
                                    Catatan (Opsional)
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData("notes", e.target.value)
                                    }
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Item Pembelian</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 sm:grid-cols-[1fr_120px_180px_auto] gap-4 items-start p-4 border rounded-lg"
                                >
                                    <div className="space-y-2">
                                        <Label>Produk</Label>
                                        <ProductCombobox
                                            products={products}
                                            value={item.product_id}
                                            onChange={(value) =>
                                                handleItemChange(
                                                    index,
                                                    "product_id",
                                                    value
                                                )
                                            }
                                            error={
                                                errors[
                                                    `items.${index}.product_id`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`quantity-${index}`}>
                                            Jumlah
                                        </Label>
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
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `items.${index}.quantity`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`cost-${index}`}>
                                            Harga Beli / Satuan
                                        </Label>
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
                                            placeholder="Rp"
                                            min="0"
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `items.${index}.cost_per_unit`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div className="pt-8">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            disabled={data.items.length <= 1}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addItem}
                                className="flex items-center gap-2"
                            >
                                <PlusCircle className="h-4 w-4" /> Tambah Item
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 flex justify-end items-center gap-6">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                    Total Keseluruhan
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(calculateTotal())}
                                </p>
                            </div>
                            <Button size="lg" disabled={processing}>
                                {processing
                                    ? "Menyimpan..."
                                    : "Simpan Transaksi"}
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
