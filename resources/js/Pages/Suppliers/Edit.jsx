import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import FormField from "@/Components/FormField";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { InputWithPrefix } from "@/Components/InputWithPrefix";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export default function Edit({ auth, supplier }) {
    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: supplier.data.name,
        contact_person: supplier.data.contact_person || "",
        email: supplier.data.email || "",
        phone:
            supplier.data.phone && supplier.data.phone.startsWith("+62")
                ? supplier.data.phone.substring(3)
                : supplier.data.phone || "",
        address: supplier.data.address || "",
        notes: supplier.data.notes || "",
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route("suppliers.update", supplier.data.id));
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Edit Supplier"
            backRoute="suppliers.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{supplier.data.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Nama Supplier"
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
                                label="Narahubung"
                                htmlFor="contact_person"
                                error={errors.contact_person}
                            >
                                <Input
                                    id="contact_person"
                                    value={data.contact_person}
                                    onChange={(e) =>
                                        setData(
                                            "contact_person",
                                            e.target.value
                                        )
                                    }
                                />
                            </FormField>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
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
                        <FormField
                            label="Catatan (Opsional)"
                            htmlFor="notes"
                            error={errors.notes}
                        >
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                            />
                        </FormField>
                        <div className="flex items-center justify-end gap-4 pt-2">
                            <Link href={route("suppliers.index")}>
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
