import { useForm, Link } from "@inertiajs/react";
import { useState } from "react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import InputError from "@/Components/InputError";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

export default function Create({ auth, types, suppliers }) {
    const [imagePreview, setImagePreview] = useState(null);
    const { data, setData, post, processing, errors, isDirty } = useForm({
        name: "",
        image: null,
        type_id: "",
        default_supplier_id: "",
        sku: "",
        price: "",
        unit: "",
        description: "",
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
        post(route("products.store"));
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Tambah Produk Baru"
            backRoute="products.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Produk</CardTitle>
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
                                <Label htmlFor="image">Gambar Produk</Label>
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
                            <div className="w-full flex justify-center">
                                <img
                                    src={imagePreview}
                                    alt="Product Preview"
                                    className="mt-2 h-40 w-40 rounded-md object-cover border"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="type_id">Tipe Produk</Label>
                                <Select
                                    onValueChange={(value) =>
                                        setData("type_id", value)
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map((type) => (
                                            <SelectItem
                                                key={type.id}
                                                value={type.id.toString()}
                                            >
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={errors.type_id}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="default_supplier_id">
                                    Supplier Andalan (Opsional)
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setData("default_supplier_id", value)
                                    }
                                >
                                    <SelectTrigger className="mt-1">
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
                                <InputError
                                    message={errors.default_supplier_id}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label htmlFor="sku">SKU</Label>
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
                            <div>
                                <Label htmlFor="price">Harga Jual</Label>
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
                                        <SelectValue placeholder="Pilih satuan" />
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

                        <div className="flex items-center justify-end gap-4 pt-2">
                            <Link href={route("products.index")}>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>
                            <Button disabled={processing || !isDirty}>
                                Simpan Produk
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}
