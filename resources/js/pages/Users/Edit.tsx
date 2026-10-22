import { Link, useForm } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import FormField from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputWithPrefix } from '@/components/InputWithPrefix';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import useTranslation from '@/hooks/useTranslation';

export default function Edit({ auth, user: userResource, roles }) {
    const { t } = useTranslation();
    const { data: user } = userResource;
    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone
            ? user.phone.replace(/^\+62/, '').replace(/\D/g, '')
            : '',
        role: user.role?.name || '',
    });
    const submit = (e) => {
        e.preventDefault();
        patch(route('users.update', { user: user.id }), {
            preserveScroll: true,
        });
    };
    return (
        <ContentPageLayout
            auth={auth}
            title={t('ui.edit_user')}
            backRoute="users.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>
                        {t('ui.edit_user_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormField
                            label={t('ui.name')}
                            htmlFor="name"
                            error={errors.name}
                        >
                            <Input
                                id="name"
                                placeholder={t('ui.full_staff_name')}
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label={t('ui.email')}
                                htmlFor="email"
                                error={errors.email}
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t('ui.work_email_example')}
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />
                            </FormField>
                            <FormField
                                label={t('ui.phone_no')}
                                htmlFor="phone"
                                error={errors.phone}
                            >
                                <InputWithPrefix
                                    prefix="+62"
                                    id="phone"
                                    placeholder="812xxxxxxxx"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData(
                                            'phone',
                                            e.target.value.replace(/\D/g, '')
                                        )
                                    }
                                />
                            </FormField>
                        </div>
                        <FormField
                            label={t('ui.role_position')}
                            htmlFor="role"
                            error={errors.role}
                        >
                            <Select
                                value={data.role}
                                onValueChange={(value) =>
                                    setData('role', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('ui.select_role')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((roleName) => (
                                        <SelectItem
                                            key={roleName}
                                            value={roleName}
                                        >
                                            {roleName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <div className="flex items-center gap-4 justify-end">
                            <Link href={route('users.index')}>
                                <Button type="button" variant="outline">
                                    {t('ui.cancel')}
                                </Button>
                            </Link>
                            <Button disabled={processing || !isDirty}>
                                {t('ui.save')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}
