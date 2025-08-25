import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import InputError from '@/Components/InputError';
import { Mail } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Password" />
            <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-xl text-primary">
                <div className="mb-6 text-sm text-center">
                    Lupa password Anda? Tidak masalah. Masukkan alamat email Anda dan kami akan mengirimkan link untuk mengatur ulang password baru.
                </div>

                {status && <div className="mb-4 font-medium text-sm text-green-600 bg-green-500/10 p-3 rounded-lg">{status}</div>}

                <form onSubmit={submit}>
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
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                        </div>
                        <InputError message={errors.email} className="mt-2 text-red-500 text-sm" />
                    </div>

                    <div className="flex items-center justify-end mt-6">
                        <Button
                            className="w-full py-3 bg-gradient-to-r from-primary to-primary/30 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-px transition-all duration-300"
                            disabled={processing}
                        >
                            Kirim Link Reset Password
                        </Button>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
