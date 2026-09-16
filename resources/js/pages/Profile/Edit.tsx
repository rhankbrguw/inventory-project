import ContentPageLayout from '@/components/ContentPageLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Card } from '@/components/ui/card';
import useTranslation from '@/hooks/useTranslation';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const { t } = useTranslation();
    return (
        <ContentPageLayout
            auth={auth}
            title={t('ui.my_profile')}
            backRoute="dashboard"
        >
            <div className="space-y-6">
                <Card>
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </Card>

                <Card>
                    <UpdatePasswordForm />
                </Card>

                <Card>
                    <DeleteUserForm />
                </Card>
            </div>
        </ContentPageLayout>
    );
}
