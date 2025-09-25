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

export default function Adjust({ auth, products, locations }) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        product_id: "",
        location_id: "",
        quantity: "",
        notes: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("stock.adjust"));
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Formulir Penyesuaian Stok"
            backRoute="stock.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Input Jumlah Stok Fisik</CardTitle>
                    <CardDescription>
                        Formulir ini digunakan untuk menyesuaikan jumlah stok di
                        sistem agar sama dengan jumlah fisik hasil stock opname.
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
                                    products={products}
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

                        <FormField
                            label="Jumlah Fisik Baru"
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
                                placeholder="Masukkan jumlah stok fisik saat ini"
                            />
                        </FormField>

                        <FormField
                            label="Catatan Penyesuaian"
                            htmlFor="notes"
                            error={errors.notes}
                        >
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                placeholder="Contoh: Koreksi hasil stock opname 24 Sept 2025"
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
