import { useRef, useState } from 'react';
import InputError from '@/components/InputError';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/PasswordInput';
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
} from '@/components/ui/alert-dialog';
import {
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import useTranslation from '@/hooks/useTranslation';

export default function DeleteUserForm({ className = '' }: { className?: string }) {
    const { t } = useTranslation();
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

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
                <CardTitle>{t('ui.delete_account')}</CardTitle>
                <CardDescription>
                    {t('ui.delete_account_desc')}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <AlertDialog
                    open={confirmingUserDeletion}
                    onOpenChange={setConfirmingUserDeletion}
                >
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">{t('ui.delete_account')}</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t('ui.confirm_delete_account')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('ui.confirm_delete_account_desc')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <form onSubmit={deleteUser}>
                            <div className="mt-4">
                                <Label
                                    htmlFor="password"
                                    className="sr-only"
                                >
                                    {t('ui.password')}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                    autoFocus
                                    placeholder={t('ui.password_placeholder')}
                                />
                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>
                            <AlertDialogFooter className="mt-6">
                                <AlertDialogCancel onClick={closeModal}>
                                    {t('ui.cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    type="submit"
                                    disabled={processing}
                                >
                                    {t('ui.delete_account')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </form>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </section>
    );
}
