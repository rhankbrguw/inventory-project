import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import FormField from "@/Components/FormField";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { InputWithPrefix } from "@/Components/InputWithPrefix";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/Components/ui/card";

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("customers.store"));
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Tambah Pelanggan Baru"
            backRoute="customers.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Formulir Pelanggan</CardTitle>
                    <CardDescription>
                        Isi detail untuk pelanggan baru yang akan ditambahkan ke
                        sistem.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Nama Depan"
                                htmlFor="first_name"
                                error={errors.first_name}
                            >
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={(e) =>
                                        setData("first_name", e.target.value)
                                    }
                                />
                            </FormField>
                            <FormField
                                label="Nama Belakang"
                                htmlFor="last_name"
                                error={errors.last_name}
                            >
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(e) =>
                                        setData("last_name", e.target.value)
                                    }
                                />
                            </FormField>
                        </div>
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
                            <Button disabled={processing}>
                                {processing
                                    ? "Menyimpan..."
                                    : "Simpan Pelanggan"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}
