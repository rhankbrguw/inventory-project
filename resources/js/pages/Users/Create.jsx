import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/components/ContentPageLayout";
import FormField from "@/components/FormField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputWithPrefix } from "@/components/InputWithPrefix";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/PasswordInput";

export default function Create({ auth, roles }) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        role: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("users.store"));
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Buat Pengguna Baru"
            backRoute="users.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Formulir Pengguna</CardTitle>
                    <CardDescription>
                        Isi detail untuk akun pengguna baru.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormField
                            label="Nama"
                            htmlFor="name"
                            error={errors.name}
                        >
                            <Input
                                id="name"
                                placeholder="Nama Lengkap Staf"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                            />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Email"
                                htmlFor="email"
                                error={errors.email}
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email.kerja@perusahaan.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                            </FormField>
                            <FormField
                                label="No. Telp"
                                htmlFor="phone"
                                error={errors.phone}
                            >
                                <InputWithPrefix
                                    prefix="+62"
                                    id="phone"
                                    placeholder="812xxxxxxxx"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData(
                                            "phone",
                                            e.target.value.replace(/\D/g, ""),
                                        )
                                    }
                                />
                            </FormField>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Password"
                                htmlFor="password"
                                error={errors.password}
                            >
                                <PasswordInput
                                    id="password"
                                    placeholder="Minimal 8 karakter"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />
                            </FormField>
                            <FormField
                                label="Konfirmasi Password"
                                htmlFor="password_confirmation"
                                error={errors.password_confirmation}
                            >
                                <PasswordInput
                                    id="password_confirmation"
                                    placeholder="Ulangi password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                />
                            </FormField>
                        </div>
                        <FormField
                            label="Jabatan"
                            htmlFor="role"
                            error={errors.role}
                        >
                            <Select
                                onValueChange={(value) =>
                                    setData("role", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Jabatan / Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((roleName) => (
                                        <SelectItem
                                            key={roleName}
                                            value={roleName}
                                        >
                                            {roleName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <div className="flex items-center gap-4 justify-end">
                            <Link href={route("users.index")}>
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
