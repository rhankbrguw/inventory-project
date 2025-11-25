import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/components/ContentPageLayout";
import FormField from "@/components/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ProductCombobox from "@/components/ProductCombobox";
import StockAvailability from "@/components/StockAvailability";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import InputError from "@/components/InputError";

export default function Adjust({
    auth,
    products,
    locations,
}) {
    const { data, setData, post, processing, errors, isDirty, reset } = useForm({
        product_id: "",
        location_id: "",
        quantity: "",
        notes: "",
    });

    const productsData = products.data || products || [];
    const locationsData = locations.data || locations || [];

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
                        Gunakan formulir ini untuk menyamakan stok sistem dengan stok fisik aktual.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={submit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Produk" htmlFor="product_id">
                                <ProductCombobox
                                    products={productsData}
                                    value={data.product_id}
                                    onChange={(product) =>
                                        setData("product_id", product.id)
                                    }
                                    error={errors.product_id}
                                    placeholder="Cari produk berdasarkan nama atau SKU..."
                                />

                                {data.location_id && data.product_id && (
                                    <StockAvailability
                                        productId={data.product_id}
                                        locationId={data.location_id}
                                        unit={selectedProduct?.unit}
                                    />
                                )}
                            </FormField>

                            <FormField label="Lokasi" htmlFor="location_id">
                                <Select
                                    value={data.location_id?.toString()}
                                    onValueChange={(value) =>
                                        setData("location_id", value)
                                    }
                                >
                                    <SelectTrigger id="location_id">
                                        <SelectValue placeholder="Pilih lokasi penyimpanan..." />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {locationsData.map((location) => (
                                            <SelectItem
                                                key={location.id}
                                                value={location.id.toString()}
                                            >
                                                {location.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <InputError message={errors.location_id} />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Jumlah Stok Aktual" htmlFor="quantity">
                                <Input
                                    id="quantity"
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={data.quantity}
                                    onChange={(e) =>
                                        setData("quantity", e.target.value)
                                    }
                                    placeholder="Masukkan jumlah stok fisik aktual"
                                    disabled={!data.product_id || !data.location_id}
                                />
                                <InputError message={errors.quantity} />
                            </FormField>
                        </div>

                        <FormField label="Catatan" htmlFor="notes">
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                placeholder="Alasan penyesuaian (contoh: selisih stok opname, barang rusak, koreksi input)"
                                disabled={!data.product_id || !data.location_id}
                            />
                            <InputError message={errors.notes} />
                        </FormField>

                        <div className="flex items-center justify-end gap-4 pt-2">
                            <Link href={route("stock.index")}>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>

                            <Button
                                disabled={
                                    processing ||
                                    !isDirty ||
                                    !data.product_id ||
                                    !data.location_id
                                }
                            >
                                Simpan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}

