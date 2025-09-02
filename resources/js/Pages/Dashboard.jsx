import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-foreground leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />
            <div className="bg-card overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-card-foreground">
                    You're logged in! This is your dashboard.
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
