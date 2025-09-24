import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import InputError from "@/Components/InputError";
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
                            <div>
                                <Label htmlFor="product_id">Produk</Label>
                                <ProductCombobox
                                    products={products}
                                    value={data.product_id}
                                    onChange={(product) =>
                                        setData("product_id", product.id)
                                    }
                                    error={errors.product_id}
                                />
                            </div>
                            <div>
                                <Label htmlFor="location_id">Lokasi</Label>
                                <Select
                                    value={data.location_id}
                                    onValueChange={(value) =>
                                        setData("location_id", value)
                                    }
                                >
                                    <SelectTrigger className="mt-1">
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
                                <InputError
                                    message={errors.location_id}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="quantity">Jumlah Fisik Baru</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={data.quantity}
                                onChange={(e) =>
                                    setData("quantity", e.target.value)
                                }
                                className="mt-1"
                                placeholder="Masukkan jumlah stok fisik saat ini"
                            />
                            <InputError
                                message={errors.quantity}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Catatan Penyesuaian</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                className="mt-1"
                                placeholder="Contoh: Koreksi hasil stock opname 24 Sept 2025"
                            />
                            <InputError
                                message={errors.notes}
                                className="mt-2"
                            />
                        </div>

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
