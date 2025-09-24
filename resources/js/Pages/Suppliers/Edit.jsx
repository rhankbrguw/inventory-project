import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import InputError from "@/Components/InputError";
import { InputWithPrefix } from "@/Components/InputWithPrefix";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

const getLocalPhoneNumber = (phone) => {
    if (phone && phone.startsWith("+62")) {
        return phone.substring(3);
    }
    return phone || "";
};

export default function Edit({ auth, supplier }) {
    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: supplier.data.name,
        contact_person: supplier.data.contact_person || "",
        email: supplier.data.email || "",
        phone: getLocalPhoneNumber(supplier.data.phone),
        address: supplier.data.address || "",
        notes: supplier.data.notes || "",
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route("suppliers.update", supplier.data.id));
    };

    const handlePhoneChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        setData("phone", rawValue);
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
                            <div>
                                <Label htmlFor="name">Nama Supplier</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="mt-1"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="contact_person">
                                    Narahubung
                                </Label>
                                <Input
                                    id="contact_person"
                                    name="contact_person"
                                    value={data.contact_person}
                                    onChange={(e) =>
                                        setData(
                                            "contact_person",
                                            e.target.value
                                        )
                                    }
                                    className="mt-1"
                                />
                                <InputError
                                    message={errors.contact_person}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="mt-1"
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Telepon</Label>
                                <InputWithPrefix
                                    prefix="+62"
                                    id="phone"
                                    name="phone"
                                    value={data.phone}
                                    onChange={handlePhoneChange}
                                    placeholder="81234567890"
                                    className="mt-1"
                                />
                                <InputError
                                    message={errors.phone}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="address">Alamat</Label>
                            <Textarea
                                id="address"
                                name="address"
                                value={data.address}
                                onChange={(e) =>
                                    setData("address", e.target.value)
                                }
                                className="mt-1"
                            />
                            <InputError
                                message={errors.address}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes">Catatan (Opsional)</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                className="mt-1"
                            />
                            <InputError
                                message={errors.notes}
                                className="mt-1"
                            />
                        </div>
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
