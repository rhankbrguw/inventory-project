import { useEffect, useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import InputError from "@/Components/InputError";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl text-primary">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-secondary to-primary rounded-xl mb-4 shadow-lg">
                        <LogIn className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome Back
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
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all"
                                autoComplete="username"
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                        </div>
                        <InputError
                            message={errors.email}
                            className="mt-2 text-red-500 text-sm"
                        />
                    </div>

                    <div>
                        <Label
                            htmlFor="password"
                            className="font-semibold block mb-2"
                        >
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={data.password}
                                className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all"
                                autoComplete="current-password"
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/60 hover:text-primary"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <InputError
                            message={errors.password}
                            className="mt-2 text-red-500 text-sm"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center select-none cursor-pointer">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                                className="w-4 h-4 text-primary bg-gray-300 border-white/30 rounded focus:ring-primary/20 cursor-pointer"
                            />
                            <span className="ml-2">Remember me</span>
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="text-sm font-light text-primary hover:text-primary/50 transition-colors duration-200"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full py-3 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                            disabled={processing}
                        >
                            Sign In
                        </Button>
                    </div>
                </form>

                <p className="text-center text-sm text-primary/80 mt-6">
                    Don't have an account yet?{" "}
                    <Link
                        href={route("register")}
                        className="font-bold text-primary hover:text-primary/70 transition-colors duration-200"
                    >
                        Register here
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
