import ContentPageLayout from '@/components/ContentPageLayout';
import { Link, useForm } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import TypeForm from './Partials/TypeForm';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function Edit({
    auth,
    type: typeResource,
    availableGroups,
    availableLevels,
    allTypes,
}) {
    const { t } = useTranslation();
    const { data: type } = typeResource;

    const { data, setData, patch, processing, errors, isDirty } = useForm({
        name: type.name || '',
        group: type.group || '',
        code: type.code || '',
        level: type.level || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('types.update', type.id));
    };

    const currentGroupHasLevels = data.group && availableLevels[data.group];

    return (
        <ContentPageLayout
            auth={auth}
            title={t('ui.edit_type')}
            backRoute="types.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{type.name}</CardTitle>
                    <CardDescription>
                        {t('ui.edit_type_desc')}
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
                            currentType={type}
                            isEdit={true}
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
