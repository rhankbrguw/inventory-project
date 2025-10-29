import ContentPageLayout from "@/components/ContentPageLayout";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import { Head } from "@inertiajs/react";
import { Card } from "@/components/ui/card";

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <ContentPageLayout
            auth={auth}
            title="Profil Saya"
            backRoute="dashboard"
        >
            <Head title="Profile" />

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
