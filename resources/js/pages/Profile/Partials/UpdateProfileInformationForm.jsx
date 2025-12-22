import InputError from "@/components/InputError";
import { Link, useForm, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputWithPrefix } from "@/components/InputWithPrefix";
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useEffect } from "react";

export default function UpdateProfileInformationForm({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const user = usePage().props.auth.user;

    const formatPhoneForInput = (phone) => {
        if (!phone) return "";
        return phone.startsWith("+62") ? phone.slice(3) : phone.startsWith("62") ? phone.slice(2) : phone;
    };

    const {
        data,
        setData,
        patch,
        errors,
        processing,
        recentlySuccessful,
        isDirty,
        defaults,
    } = useForm({
        name: user.name,
        email: user.email,
        phone: formatPhoneForInput(user.phone),
    });

    useEffect(() => {
        const newData = {
            name: user.name,
            email: user.email,
            phone: formatPhoneForInput(user.phone),
        };

        setData(newData);

        if (typeof defaults === 'function') {
            defaults(newData);
        }
    }, [user]);

    const submit = (e) => {
        e.preventDefault();
        patch(route("profile.update"), {
            preserveScroll: true,
            onSuccess: () => {
            },
        });
    };

    return (
        <section className={className}>
            <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>
                    Perbarui informasi profil dan alamat email akun Anda.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="mt-6 space-y-6">
                    <div>
                        <Label htmlFor="name">Nama</Label>
                        <Input
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    <div>
                        <Label htmlFor="phone">No. Telp</Label>
                        <div className="mt-1">
                            <InputWithPrefix
                                prefix="+62"
                                id="phone"
                                value={data.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setData("phone", val);
                                }}
                                placeholder="812xxxxxxxx"
                                autoComplete="tel"
                            />
                        </div>
                        <InputError className="mt-2" message={errors.phone} />
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div>
                            <p className="text-sm mt-2 text-foreground">
                                Alamat email Anda belum terverifikasi.
                                <Link
                                    href={route("verification.send")}
                                    method="post"
                                    as="button"
                                    className="underline text-sm text-muted-foreground hover:text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                                >
                                    Klik di sini untuk mengirim ulang email verifikasi.
                                </Link>
                            </p>
                            {status === "verification-link-sent" && (
                                <div className="mt-2 font-medium text-sm text-success-foreground bg-success/10 p-3 rounded-lg">
                                    Tautan verifikasi baru telah dikirim ke alamat email Anda.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button disabled={processing || !isDirty}>
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-muted-foreground">Tersimpan.</p>
                        </Transition>
                    </div>
                </form>
            </CardContent>
        </section>
    );
}
