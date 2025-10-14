import { useEffect } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import InputError from "@/Components/InputError";
import { Checkbox } from "@/Components/ui/checkbox";
import { Mail, Lock, LogIn } from "lucide-react";
import { PasswordInput } from "@/Components/PasswordInput";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    useEffect(() => () => reset("password"), []);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />
            <div className="backdrop-blur-sm bg-card/10 border border-border/20 rounded-2xl p-6 sm:p-8 shadow-xl text-foreground">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-secondary to-primary rounded-xl mb-4 shadow-lg">
                        <LogIn className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Selamat Datang Kembali
                    </h1>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <Label
                            htmlFor="email"
                            className="font-semibold block mb-2"
                        >
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                className="w-full pl-10 pr-4 py-3 bg-background/20 border-border/30 rounded-xl focus:border-secondary transition-all"
                                autoComplete="username"
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                        </div>
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <Label
                            htmlFor="password"
                            className="font-semibold block mb-2"
                        >
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <PasswordInput
                                id="password"
                                value={data.password}
                                className="w-full pl-10 pr-12 py-3 bg-background/20 border-border/30 rounded-xl focus:border-secondary transition-all"
                                autoComplete="current-password"
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                            />
                        </div>
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center select-none cursor-pointer">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData("remember", checked)
                                }
                            />
                            <Label
                                htmlFor="remember"
                                className="ml-2 font-normal"
                            >
                                Ingat saya
                            </Label>
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="font-semibold text-foreground/90 hover:text-foreground transition-colors duration-200"
                            >
                                Lupa password?
                            </Link>
                        )}
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:-translate-y-px transition-all duration-300"
                            disabled={processing}
                        >
                            Masuk
                        </Button>
                    </div>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Belum punya akun?{" "}
                    <Link
                        href={route("register")}
                        className="font-bold text-foreground hover:text-foreground/80 transition-colors duration-200"
                    >
                        Daftar di sini
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
