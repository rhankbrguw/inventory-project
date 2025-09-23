import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import InputError from "@/Components/InputError";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export default function Edit({ auth, user, roles }) {
    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: user.data.name || "",
        email: user.data.email || "",
        role: user.data.role || "",
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route("users.update", { user: user.data.id }), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-foreground leading-tight">
                    Edit Pengguna: {user.data.name}
                </h2>
            }
        >
            <Head title={`Edit Pengguna: ${user.data.name}`} />

            <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Formulir Edit Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label htmlFor="name">Nama</Label>
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
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="mt-1"
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="role">Jabatan</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(value) =>
                                        setData("role", value)
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Pilih jabatan" />
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
                                <InputError
                                    message={errors.role}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex items-center gap-4 justify-end">
                                <Link href={route("users.index")}>
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
