import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Card, CardContent } from "@/Components/ui/card";

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-foreground leading-tight">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-4">
                <Card className="overflow-hidden shadow-sm sm:rounded-lg">
                    <CardContent className="p-6 text-card-foreground">
                        You're logged in! This is your dashboard.
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
