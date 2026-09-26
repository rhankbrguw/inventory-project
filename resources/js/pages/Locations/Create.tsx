import { Link, useForm } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import FormField from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useTranslation from '@/hooks/useTranslation';

export default function Create({ auth, locationTypes }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, isDirty } = useForm({
        name: '',
        type_id: '',
        address: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('locations.store'));
    };

    return (
        <ContentPageLayout
            auth={auth}
            title={t('ui.add_new_location')}
            backRoute="locations.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{t('ui.location_details')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <FormField
                            label={t('ui.location_name')}
                            htmlFor="name"
                            error={errors.name}
                        >
                            <Input
                                id="name"
                                placeholder={t('ui.location_name_example')}
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                        </FormField>

                        <FormField
                            label={t('ui.location_type')}
                            htmlFor="type_id"
                            error={errors.type_id}
                        >
                            <Select
                                value={data.type_id}
                                onValueChange={(value) =>
                                    setData('type_id', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('ui.select_location_type')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {locationTypes.map((type) => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.id.toString()}
                                        >
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField
                            label={t('ui.address_optional')}
                            htmlFor="address"
                            error={errors.address}
                        >
                            <Textarea
                                id="address"
                                placeholder={t('ui.location_address_placeholder')}
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                            />
                        </FormField>

                        <div className="flex items-center justify-end gap-4">
                            <Link href={route('locations.index')}>
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
