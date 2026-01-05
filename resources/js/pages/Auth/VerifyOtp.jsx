import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/layouts/GuestLayout';
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

            <Card className="mx-auto max-w-sm backdrop-blur-sm bg-card/10 border border-border/20 shadow-xl text-foreground">
                <CardHeader>
                    <CardTitle className="text-2xl">Verifikasi Akun</CardTitle>
                    <CardDescription>
                        Kami telah mengirimkan kode 6 digit ke{' '}
                        <span className="font-semibold text-foreground">
                            {email}
                        </span>
                        . Masukkan kode tersebut di bawah ini.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status && (
                        <div className="mb-4 font-medium text-sm text-success-foreground bg-success/10 p-3 rounded-lg">
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
                                    onChange={(e) =>
                                        setData('otp_code', e.target.value)
                                    }
                                    required
                                    maxLength="6"
                                />
                                <InputError
                                    message={errors.otp_code || errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                Verifikasi
                            </Button>
                        </div>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">
                            Tidak menerima kode?{' '}
                        </span>
                        <Button
                            variant="link"
                            onClick={handleResend}
                            className="p-0 h-auto"
                            disabled={resendForm.processing}
                        >
                            Kirim ulang
                        </Button>
                    </div>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        <i>
                            Pastikan untuk memeriksa folder spam atau inbox
                            email Anda. Jika terjadi sesuatu, silakan gunakan
                            opsi kirim ulang dan refresh halaman email anda bila
                            perlu.
                        </i>
                    </p>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
