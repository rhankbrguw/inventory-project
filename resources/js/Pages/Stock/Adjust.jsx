import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import FormField from "@/Components/FormField";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import ProductCombobox from "@/Components/ProductCombobox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/Components/ui/card";

const adjustmentReasons = [
    { value: "Rusak", label: "Barang Rusak" },
    { value: "Retur", label: "Barang Retur" },
];

export default function Adjust({ auth, products, locations }) {
    const { data, setData, post, processing, errors, isDirty, reset } = useForm({
        product_id: "",
        location_id: "",
        reason: "",
        quantity: "",
        notes: "",
    });

    const productsData = products.data || [];
    const selectedProduct = data.product_id
        ? productsData.find((p) => p.id == data.product_id)
        : null;

    const submit = (e) => {
        e.preventDefault();
        post(route("stock.adjust"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Buat Penyesuaian Stok"
            backRoute="stock.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Formulir Penyesuaian Stok</CardTitle>
                    <CardDescription>
                        Gunakan formulir ini untuk mencatat stok yang berkurang karena rusak atau diretur.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Produk"
                                htmlFor="product_id"
                                error={errors.product_id}
                            >
                                <ProductCombobox
                                    products={productsData}
                                    value={data.product_id}
                                    onChange={(product) =>
                                        setData("product_id", product.id)
                                    }
                                />
                            </FormField>
                            <FormField
                                label="Lokasi"
                                htmlFor="location_id"
                                error={errors.location_id}
                            >
                                <Select
                                    value={data.location_id}
                                    onValueChange={(value) =>
                                        setData("location_id", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih lokasi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map((location) => (
                                            <SelectItem
                                                key={location.id}
                                                value={location.id.toString()}
                                            >
                                                {location.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField
                                label="Alasan Penyesuaian"
                                htmlFor="reason"
                                error={errors.reason}
                            >
                                <Select
                                    value={data.reason}
                                    onValueChange={(value) =>
                                        setData("reason", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih alasan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {adjustmentReasons.map((reason) => (
                                            <SelectItem
                                                key={reason.value}
                                                value={reason.value}
                                            >
                                                {reason.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                            <FormField
                                label={`Jumlah yang Disesuaikan (${selectedProduct?.unit || '...' })`}
                                htmlFor="quantity"
                                error={errors.quantity}
                            >
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={data.quantity}
                                    onChange={(e) =>
                                        setData("quantity", e.target.value)
                                    }
                                    placeholder="Contoh: 5"
                                />
                            </FormField>
                        </div>
                        <FormField
                            label="Catatan (Opsional)"
                            htmlFor="notes"
                            error={errors.notes}
                        >
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                placeholder="Contoh: Rusak karena jatuh saat pengiriman."
                            />
                        </FormField>

                        <div className="flex items-center justify-end gap-4 pt-2">
                            <Link href={route("stock.index")}>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>
                            <Button disabled={processing || !isDirty}>
                                Simpan Penyesuaian
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}
