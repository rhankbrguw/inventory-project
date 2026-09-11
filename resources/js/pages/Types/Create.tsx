import { Link, useForm } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import useTranslation from '@/hooks/useTranslation';
import TypeForm from './Partials/TypeForm';

export default function Create({
    auth,
    availableGroups,
    availableLevels,
    allTypes,
}) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, isDirty } = useForm({
        name: '',
        group: '',
        code: '',
        level: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('types.store'));
    };

    const currentGroupHasLevels = data.group && availableLevels[data.group];

    return (
        <ContentPageLayout
            auth={auth}
            title={t('ui.add_new_type')}
            backRoute="types.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{t('ui.type_info')}</CardTitle>
                    <CardDescription>
                        {t('ui.type_info_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <TypeForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            availableGroups={availableGroups}
                            availableLevels={availableLevels}
                            allTypes={allTypes}
                        />

                        <div className="flex items-center justify-end gap-4 pt-2">
                            <Link href={route('types.index')}>
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
