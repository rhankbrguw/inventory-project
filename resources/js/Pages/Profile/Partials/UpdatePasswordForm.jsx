import { useRef } from "react";
import InputError from "@/Components/InputError";
import { useForm } from "@inertiajs/react";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Transition } from "@headlessui/react";
import { PasswordInput } from "@/Components/PasswordInput";

export default function UpdatePasswordForm({ className = "" }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset("current_password");
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <CardHeader>
                <CardTitle>Perbarui Password</CardTitle>
                <CardDescription>
                    Pastikan akun Anda menggunakan password yang panjang dan
                    acak agar tetap aman.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={updatePassword} className="mt-6 space-y-6">
                    <div>
                        <Label htmlFor="current_password">
                            Password Saat Ini
                        </Label>
                        <PasswordInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData("current_password", e.target.value)
                            }
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                        />
                        <InputError
                            message={errors.current_password}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password Baru</Label>
                        <PasswordInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                        />
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label htmlFor="password_confirmation">
                            Konfirmasi Password
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Simpan</Button>
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-muted-foreground">
                                Tersimpan.
                            </p>
                        </Transition>
                    </div>
                </form>
            </CardContent>
        </section>
    );
}
