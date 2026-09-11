import { useRef } from 'react';
import InputError from '@/components/InputError';
import { useForm } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Transition } from '@headlessui/react';
import { PasswordInput } from '@/components/PasswordInput';
import useTranslation from '@/hooks/useTranslation';

export default function UpdatePasswordForm({ className = '' }: { className?: string }) {
    const { t } = useTranslation();
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful, isDirty } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <CardHeader>
                <CardTitle>{t('ui.update_password')}</CardTitle>
                <CardDescription>
                    {t('ui.update_password_desc')}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={updatePassword} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="current_password">
                            {t('ui.current_password')}
                        </Label>
                        <PasswordInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            placeholder={t('ui.current_password_placeholder')}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
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
                        <Label htmlFor="password">{t('ui.new_password')}</Label>
                        <PasswordInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            placeholder={t('ui.strong_password_placeholder')}
                            onChange={(e) =>
                                setData('password', e.target.value)
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
                            {t('ui.confirm_password')}
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            placeholder={t('ui.confirm_password_placeholder')}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
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
                            {processing ? t('ui.saving') : t('ui.save')}
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition ease-in-out duration-300"
                            leaveTo="opacity-0"
                        >
                            <p className="text-xs text-muted-foreground">{t('ui.saved')}</p>
                        </Transition>
                    </div>
                </form>
            </CardContent>
        </section>
    );
}
