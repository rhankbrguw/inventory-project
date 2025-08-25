import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user} title="Dashboard">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    You're logged in! This is your dashboard.
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
