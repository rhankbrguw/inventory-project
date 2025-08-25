import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import InputError from '@/Components/InputError';
import { Mail, Lock } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'));
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />
            <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-xl text-primary">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Atur Password Baru</h1>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <Label htmlFor="email" className="font-semibold block mb-2">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:border-secondary transition-all"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                        </div>
                        <InputError message={errors.email} className="mt-2 text-red-500 text-sm" />
                    </div>

                    <div>
                        <Label htmlFor="password" className="font-semibold block mb-2">Password Baru</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:border-secondary transition-all"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                        </div>
                        <InputError message={errors.password} className="mt-2 text-red-500 text-sm" />
                    </div>

                    <div>
                        <Label htmlFor="password_confirmation" className="font-semibold block mb-2">Konfirmasi Password Baru</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:border-secondary transition-all"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-2 text-red-500 text-sm" />
                    </div>

                    <div className="pt-4">
                        <Button className="w-full py-3 bg-gradient-to-r from-primary to-primary/30 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-px transition-all duration-300" disabled={processing}>
                            Reset Password
                        </Button>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
