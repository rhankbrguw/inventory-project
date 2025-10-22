import { useForm, Link } from "@inertiajs/react";
import { useState } from "react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import FormField from "@/Components/FormField";
import CurrencyInput from "@/Components/CurrencyInput";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export default function Edit({
    auth,
    product: productResource,
    types,
    suppliers,
}) {
    const { data: product } = productResource;
    const [imagePreview, setImagePreview] = useState(product.image_url || null);

    const { data, setData, post, errors, processing, isDirty } = useForm({
        name: product.name || "",
        sku: product.sku || "",
        price: product.price || "",
        unit: product.unit || "",
        description: product.description || "",
        image: null,
        type_id: product.type?.id || "",
        default_supplier_id: product.default_supplier?.id || "",
        _method: "patch",
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
        post(route("products.update", product.id), {
            forceFormData: true,
        });
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Edit Produk"
            backRoute="products.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Nama Produk"
                                htmlFor="name"
                                error={errors.name}
                            >
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                />
                            </FormField>
                            <FormField
                                label="Ganti Gambar Produk"
                                htmlFor="image"
                                error={errors.image}
                            >
                                <Input
                                    id="image"
                                    type="file"
                                    onChange={handleImageChange}
                                    className="file:text-foreground"
                                />
                            </FormField>
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
                            <FormField
                                label="Tipe Produk"
                                htmlFor="type_id"
                                error={errors.type_id}
                            >
                                <Select
                                    defaultValue={data.type_id.toString()}
                                    onValueChange={(value) =>
                                        setData("type_id", value)
                                    }
                                >
                                    <SelectTrigger>
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
                            </FormField>
                            <FormField
                                label="Supplier Andalan (Opsional)"
                                htmlFor="default_supplier_id"
                                error={errors.default_supplier_id}
                            >
                                <Select
                                    defaultValue={data.default_supplier_id?.toString()}
                                    onValueChange={(value) =>
                                        setData("default_supplier_id", value)
                                    }
                                >
                                    <SelectTrigger>
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
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                label="SKU"
                                htmlFor="sku"
                                error={errors.sku}
                            >
                                <Input
                                    id="sku"
                                    value={data.sku}
                                    onChange={(e) =>
                                        setData("sku", e.target.value)
                                    }
                                />
                            </FormField>
                            <FormField
                                label="Harga Jual"
                                htmlFor="price"
                                error={errors.price}
                            >
                                <CurrencyInput
                                    id="price"
                                    placeholder="Contoh: 30000"
                                    value={data.price}
                                    onValueChange={(value) =>
                                        setData("price", value)
                                    }
                                />
                            </FormField>
                            <FormField
                                label="Satuan"
                                htmlFor="unit"
                                error={errors.unit}
                            >
                                <Select
                                    value={data.unit}
                                    onValueChange={(value) =>
                                        setData("unit", value)
                                    }
                                >
                                    <SelectTrigger>
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
                            </FormField>
                        </div>

                        <FormField
                            label="Deskripsi (Opsional)"
                            htmlFor="description"
                            error={errors.description}
                        >
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                            />
                        </FormField>

                        <div className="flex items-center justify-end gap-4 pt-2">
                            <Link href={route("products.index")}>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>
                            <Button disabled={processing || !isDirty}>
                                Simpan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}
