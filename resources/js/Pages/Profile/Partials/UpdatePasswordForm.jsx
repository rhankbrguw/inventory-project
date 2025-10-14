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
        isDirty,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset("current_password");
                    currentPasswordInput.current?.focus();
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
                <form onSubmit={updatePassword} className="space-y-6">
                    <div className="space-y-2">
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
                            className="w-full"
                            autoComplete="current-password"
                            required
                        />
                        <InputError
                            message={errors.current_password}
                            className="mt-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password Baru</Label>
                        <PasswordInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="w-full"
                            autoComplete="new-password"
                            required
                        />
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">
                            Konfirmasi Password
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            className="w-full"
                            autoComplete="new-password"
                            required
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing || !isDirty}>
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition ease-in-out duration-300"
                            leaveTo="opacity-0"
                        ></Transition>
                    </div>
                </form>
            </CardContent>
        </section>
    );
}
