import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import InputError from "@/Components/InputError";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export default function Create({ auth }) {
    const { data, setData, post, errors, processing } = useForm({
        name: "",
        sku: "",
        price: "",
        unit: "",
        description: "",
    });

    const productUnits = ["kg", "pcs", "ekor", "pack", "box"];

    const submit = (e) => {
        e.preventDefault();
        post(route("products.store"));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-foreground leading-tight">
                    Tambah Produk Baru
                </h2>
            }
        >
            <Head title="Tambah Produk" />

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Formulir Produk</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Label htmlFor="name">Nama Produk</Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="sku">
                                SKU (Stock Keeping Unit)
                            </Label>
                            <Input
                                id="sku"
                                name="sku"
                                value={data.sku}
                                onChange={(e) => setData("sku", e.target.value)}
                            />
                            <InputError message={errors.sku} className="mt-2" />
                        </div>

                        <div>
                            <Label htmlFor="price">Harga</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                value={data.price}
                                onChange={(e) =>
                                    setData("price", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.price}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="unit">Satuan</Label>
                            <Select
                                onValueChange={(value) =>
                                    setData("unit", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih satuan produk" />
                                </SelectTrigger>
                                <SelectContent>
                                    {productUnits.map((unit) => (
                                        <SelectItem key={unit} value={unit}>
                                            {unit.charAt(0).toUpperCase() +
                                                unit.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={errors.unit}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">
                                Deskripsi (Opsional)
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.description}
                                className="mt-2"
                            />
                        </div>

                        <div className="flex items-center gap-4 justify-end">
                            <Link href={route("products.index")}>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>
                            <Button disabled={processing}>Simpan Produk</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
