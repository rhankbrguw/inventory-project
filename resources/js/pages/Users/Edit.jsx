import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/components/ContentPageLayout";
import FormField from "@/components/FormField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export default function Edit({ auth, user: userResource, roles }) {
    const { data: user } = userResource;

    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role?.name || "",
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route("users.update", { user: user.id }), {
            preserveScroll: true,
        });
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Edit Pengguna"
            backRoute="users.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>
                        Ubah detail untuk akun pengguna yang sudah ada.
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
                            label="Jabatan"
                            htmlFor="role"
                            error={errors.role}
                        >
                            <Select
                                value={data.role}
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
