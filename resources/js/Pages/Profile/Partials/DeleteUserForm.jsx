import { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import { CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <CardHeader>
                <CardTitle>Hapus Akun</CardTitle>
                <CardDescription>
                    Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen.
                </CardDescription>
            </CardHeader>

            <div className="px-6 pb-6">
                <AlertDialog open={confirmingUserDeletion} onOpenChange={setConfirmingUserDeletion}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Hapus Akun</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin ingin menghapus akun Anda?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Silakan masukkan password Anda untuk mengonfirmasi.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <form onSubmit={deleteUser}>
                            <div className="mt-4">
                                <Label htmlFor="password" value="Password" className="sr-only" />
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-1 block w-full"
                                    autoFocus
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>
                            <AlertDialogFooter className="mt-6">
                                <AlertDialogCancel onClick={closeModal}>Batal</AlertDialogCancel>
                                <AlertDialogAction type="submit" disabled={processing}>
                                    Hapus Akun
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </form>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </section>
    );
}
