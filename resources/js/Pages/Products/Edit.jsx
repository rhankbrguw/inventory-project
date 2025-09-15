import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { useState } from "react";
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
import { Textarea } from "@/Components/ui/textarea";

export default function Edit({ auth, product }) {
    const [imagePreview, setImagePreview] = useState(
        product.data.image_url || null
    );

    const { data, setData, post, errors, processing, isDirty } = useForm({
        name: product.data.name || "",
        sku: product.data.sku || "",
        price: product.data.price || "",
        unit: product.data.unit || "",
        description: product.data.description || "",
        image: null,
        _method: "patch", // Method spoofing untuk update dengan file
    });

    const productUnits = ["kg", "pcs", "ekor", "pack", "box"];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        // Gunakan post karena ada file upload
        post(route("products.update", product.data.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-foreground leading-tight">
                    Edit Produk: {product.data.name}
                </h2>
            }
        >
            <Head title={`Edit Produk: ${product.data.name}`} />

            <div className="py-6 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Formulir Edit Produk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="name">Nama Produk</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className="mt-1"
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="image">
                                        Ganti Gambar Produk
                                    </Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        onChange={handleImageChange}
                                        className="mt-1 file:text-foreground"
                                    />
                                    <InputError
                                        message={errors.image}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            {imagePreview && (
                                <div>
                                    <Label>Preview Gambar</Label>
                                    <img
                                        src={imagePreview}
                                        alt="Product Preview"
                                        className="mt-2 h-40 w-40 rounded-md object-cover border"
                                    />
                                </div>
                            )}

                            <div>
                                <Label htmlFor="sku">
                                    SKU (Stock Keeping Unit)
                                </Label>
                                <Input
                                    id="sku"
                                    value={data.sku}
                                    onChange={(e) =>
                                        setData("sku", e.target.value)
                                    }
                                    className="mt-1"
                                />
                                <InputError
                                    message={errors.sku}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="price">Harga</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={data.price}
                                        onChange={(e) =>
                                            setData("price", e.target.value)
                                        }
                                        className="mt-1"
                                    />
                                    <InputError
                                        message={errors.price}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="unit">Satuan</Label>
                                    <Select
                                        value={data.unit}
                                        onValueChange={(value) =>
                                            setData("unit", value)
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih satuan produk" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {productUnits.map((unit) => (
                                                <SelectItem
                                                    key={unit}
                                                    value={unit}
                                                >
                                                    {unit
                                                        .charAt(0)
                                                        .toUpperCase() +
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
                            </div>

                            <div>
                                <Label>Ketersediaan di Cabang</Label>
                                <div className="mt-2 p-4 border rounded-md text-sm text-muted-foreground italic">
                                    Fitur ketersediaan per cabang telah
                                    dinonaktifkan.
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">
                                    Deskripsi (Opsional)
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    className="mt-1"
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
                                <Button disabled={processing || !isDirty}>
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
