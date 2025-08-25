import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function VerifyOtp({ email, status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: email || '',
        otp_code: '',
    });

    const resendForm = useForm({
        email: email || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('otp.verify'));
    };

    const handleResend = (e) => {
        e.preventDefault();
        resendForm.post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi OTP" />

            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Verifikasi Akun</CardTitle>
                    <CardDescription>
                        Kami telah mengirimkan kode 6 digit ke <strong>{email}</strong>. Masukkan kode tersebut di bawah ini.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status && (
                        <div className="mb-4 font-medium text-sm text-green-600">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="otp_code">Kode OTP</Label>
                                <Input
                                    id="otp_code"
                                    type="text"
                                    name="otp_code"
                                    value={data.otp_code}
                                    className="mt-1 block w-full"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    onChange={(e) => setData('otp_code', e.target.value)}
                                    required
                                    maxLength="6"
                                />
                                <InputError message={errors.otp_code || errors.email} className="mt-2" />
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                Verifikasi
                            </Button>
                        </div>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        Tidak menerima kode?{' '}
                        <button
                            onClick={handleResend}
                            className="underline disabled:text-gray-400"
                            disabled={resendForm.processing}
                        >
                            Kirim ulang
                        </button>
                    </div>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
