import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import InputError from "@/Components/InputError";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export default function Adjust({ auth, products, locations }) {
    const { data, setData, post, errors, processing } = useForm({
        product_id: "",
        location_id: "",
        quantity: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("stock.adjust"));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-foreground leading-tight">
                    Formulir Penyesuaian Stok
                </h2>
            }
        >
            <Head title="Penyesuaian Stok" />

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Sesuaikan Jumlah Stok</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Label htmlFor="product_id">Produk</Label>
                            <Select
                                onValueChange={(value) =>
                                    setData("product_id", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih produk..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem
                                            key={product.id}
                                            value={product.id.toString()}
                                        >
                                            {product.name} ({product.sku})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={errors.product_id}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="location_id">Lokasi</Label>
                            <Select
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
                                            {location.name} ({location.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={errors.location_id}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="quantity">Jumlah Stok Baru</Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                value={data.quantity}
                                onChange={(e) =>
                                    setData("quantity", e.target.value)
                                }
                                placeholder="Masukkan jumlah stok fisik saat ini"
                            />
                            <InputError
                                message={errors.quantity}
                                className="mt-2"
                            />
                        </div>

                        <div className="flex items-center gap-4 justify-end">
                            <Link href={route("stock.index")}>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>
                            <Button disabled={processing}>
                                Simpan Penyesuaian
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
