import { useForm, Link } from "@inertiajs/react";
import ContentPageLayout from "@/components/ContentPageLayout";
import FormField from "@/components/FormField";
import CurrencyInput from "@/components/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Checkbox from "@/components/Checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Upload } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

export default function Edit({
    auth,
    product: productResource,
    types,
    suppliers,
    validUnits,
}) {
    const { data: product } = productResource;

    const { data, setData, post, errors, processing, isDirty } = useForm({
        name: product.name || "",
        sku: product.sku || "",
        price: product.price || "",
        unit: product.unit || "",
        description: product.description || "",
        image: null,
        type_id: product.type?.id?.toString() || "",
        suppliers: product.suppliers ? product.suppliers.map((s) => s.id) : [],
        default_supplier_id: product.default_supplier?.id?.toString() || "",
        _method: "patch",
    });

    const { preview, fileInputRef, handleChange, triggerInput } =
        useImageUpload(product.image_url);

    const handleSupplierToggle = (supplierId) => {
        const id = parseInt(supplierId);
        const currentSuppliers = [...data.suppliers];

        if (currentSuppliers.includes(id)) {
            const newSuppliers = currentSuppliers.filter((s) => s !== id);
            setData({
                ...data,
                suppliers: newSuppliers,
                default_supplier_id:
                    data.default_supplier_id == id
                        ? ""
                        : data.default_supplier_id,
            });
        } else {
            setData("suppliers", [...currentSuppliers, id]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("products.update", product.id), {
            forceFormData: true,
        });
    };

    const selectedSupplierObjects = suppliers.filter((s) =>
        data.suppliers.includes(s.id),
    );

    const getSupplierDisplayText = () => {
        if (data.suppliers.length === 0)
            return "Pilih Supplier (Bisa lebih dari satu)";
        if (data.suppliers.length === 1) {
            const supplier = suppliers.find((s) => s.id === data.suppliers[0]);
            return supplier?.name || "1 supplier dipilih";
        }
        return `${data.suppliers.length} supplier dipilih`;
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <FormField
                                label="Nama Produk"
                                htmlFor="name"
                                error={errors.name}
                            >
                                <Input
                                    id="name"
                                    value={data.name}
                                    placeholder="Masukkan nama produk lengkap"
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
                                <div className="flex gap-2 items-center">
                                    <input
                                        id="image"
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleChange(e, setData)
                                        }
                                    />

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-start text-muted-foreground font-normal"
                                        onClick={triggerInput}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {data.image
                                            ? data.image.name
                                            : "Pilih gambar baru..."}
                                    </Button>
                                </div>
                            </FormField>
                        </div>

                        {preview && (
                            <div className="flex justify-center w-full">
                                <div className="bg-muted/30 p-2 rounded-lg border border-dashed">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="h-40 w-auto object-contain rounded-md shadow-sm"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Tipe Produk"
                                htmlFor="type_id"
                                error={errors.type_id}
                            >
                                <Select
                                    value={data.type_id}
                                    onValueChange={(value) =>
                                        setData("type_id", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tipe Produk" />
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
                                label="Supplier (Pilih Satu atau Lebih)"
                                htmlFor="suppliers"
                                error={errors.suppliers}
                            >
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between font-normal"
                                        >
                                            {getSupplierDisplayText()}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[var(--radix-popover-trigger-width)] p-0"
                                        align="start"
                                    >
                                        <div className="max-h-[300px] overflow-y-auto p-4">
                                            <div className="space-y-3">
                                                {suppliers.map((supplier) => (
                                                    <div
                                                        key={supplier.id}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <Checkbox
                                                            id={`supp-${supplier.id}`}
                                                            checked={data.suppliers.includes(
                                                                supplier.id,
                                                            )}
                                                            onChange={() =>
                                                                handleSupplierToggle(
                                                                    supplier.id,
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor={`supp-${supplier.id}`}
                                                            className="text-sm leading-none cursor-pointer flex-1 select-none"
                                                        >
                                                            {supplier.name}
                                                        </label>
                                                        {data.suppliers.includes(
                                                            supplier.id,
                                                        ) && (
                                                                <Check className="h-4 w-4 text-primary" />
                                                            )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </FormField>
                        </div>

                        <FormField
                            label="Supplier Utama (Default)"
                            htmlFor="default_supplier_id"
                            error={errors.default_supplier_id}
                            description="Supplier ini akan otomatis terpilih saat membuat PO."
                        >
                            <Select
                                value={data.default_supplier_id?.toString()}
                                onValueChange={(value) =>
                                    setData("default_supplier_id", value)
                                }
                                disabled={data.suppliers.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Supplier Utama" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedSupplierObjects.map((supplier) => (
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                label="SKU"
                                htmlFor="sku"
                                error={errors.sku}
                            >
                                <Input
                                    id="sku"
                                    value={data.sku}
                                    placeholder="Masukkan kode SKU unik"
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
                                    placeholder="Contoh: 50000"
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
                                        <SelectValue placeholder="Pilih Satuan Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {validUnits.map((unit) => (
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
                                placeholder="Tulis deskripsi detail produk..."
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                className="h-24"
                            />
                        </FormField>

                        <div className="flex items-center justify-end gap-4 pt-2">
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
        </ContentPageLayout>
    );
}
