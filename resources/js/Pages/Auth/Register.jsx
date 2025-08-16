import { useEffect, useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import InputError from "@/Components/InputError";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset("password", "password_confirmation");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("register"));
    };

    return (
        <GuestLayout>
            <Head title="Register" />
            <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl text-primary">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-xl mb-4 shadow-lg">
                        <User className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Create an Account
                    </h1>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <Label
                            htmlFor="name"
                            className="font-semibold block mb-2"
                        >
                            Full Name
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all"
                                autoComplete="name"
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                required
                            />
                        </div>
                        <InputError
                            message={errors.name}
                            className="mt-2 text-red-500 text-sm"
                        />
                    </div>

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
                                required
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
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                required
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

                    <div>
                        <Label
                            htmlFor="password_confirmation"
                            className="font-semibold block mb-2"
                        >
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
                            <Input
                                id="password_confirmation"
                                type={showConfirmPassword ? "text" : "password"}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all"
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData(
                                        "password_confirmation",
                                        e.target.value
                                    )
                                }
                                required
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/60 hover:text-primary"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2 text-red-500 text-sm"
                        />
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                            disabled={processing}
                        >
                            Sign Up
                        </Button>
                    </div>
                </form>

                <p className="text-center text-sm text-primary/80 mt-6">
                    Already have an account?{" "}
                    <Link
                        href={route("login")}
                        className="font-bold text-primary hover:text-primary/70 transition-colors duration-200"
                    >
                        Login here
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
