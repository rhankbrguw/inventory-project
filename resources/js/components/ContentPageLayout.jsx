import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ContentPageLayout({
    title,
    backRoute,
    action = null,
    children,
}) {
    return (
        <AuthenticatedLayout>
            <Head title={title} />
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="print-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route(backRoute)}>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {title}
                        </h1>
                    </div>
                    <div className="flex gap-2 justify-end">{action}</div>
                </div>
                {children}
            </div>
        </AuthenticatedLayout>
    );
}
