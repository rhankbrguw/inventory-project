import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import FormField from "@/Components/FormField";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { InputWithPrefix } from "@/Components/InputWithPrefix";
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

export default function Edit({ auth, customer, customerTypes = { data: [] } }) {
    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: customer.data.name || "",
        type_id: customer.data.type_id || "",
        email: customer.data.email || "",
        phone: customer.data.phone?.replace("+62 ", "").replace(/-/g, "") || "",
        address: customer.data.address || "",
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route("customers.update", customer.data.id), {
            preserveScroll: true,
        });
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Edit Pelanggan"
            backRoute="customers.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{customer.data.name}</CardTitle>
                    <CardDescription>
                        Perbarui detail untuk pelanggan yang sudah ada.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormField
                            label="Nama Pelanggan"
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
                            label="Tipe Pelanggan"
                            htmlFor="type_id"
                            error={errors.type_id}
                        >
                            <Select
                                value={data.type_id.toString()}
                                onValueChange={(value) =>
                                    setData("type_id", value)
                                }
                            >
                                <SelectTrigger id="type_id">
                                    <SelectValue placeholder="Pilih tipe pelanggan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customerTypes.data.map((type) => (
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
                            label="Email"
                            htmlFor="email"
                            error={errors.email}
                        >
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                        </FormField>
                        <FormField
                            label="Telepon"
                            htmlFor="phone"
                            error={errors.phone}
                        >
                            <InputWithPrefix
                                prefix="+62"
                                id="phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData(
                                        "phone",
                                        e.target.value.replace(/\D/g, "")
                                    )
                                }
                                placeholder="81234567890"
                            />
                        </FormField>
                        <FormField
                            label="Alamat"
                            htmlFor="address"
                            error={errors.address}
                        >
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) =>
                                    setData("address", e.target.value)
                                }
                            />
                        </FormField>
                        <div className="flex items-center gap-4 justify-end">
                            <Link href={route("customers.index")}>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>
                            <Button disabled={processing || !isDirty}>
                                {processing
                                    ? "Menyimpan..."
                                    : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}
