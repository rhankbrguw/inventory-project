import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function IndexPageLayout({
    title,
    createRoute,
    buttonLabel,
    icon,
    headerActions,
    children,
}) {
    const ButtonIcon = icon || Plus;

    return (
        <AuthenticatedLayout>
            <Head title={title} />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {title}
                </h1>
                <div className="flex items-center gap-2">
                    {headerActions}
                    {createRoute && (
                        <Link href={route(createRoute)}>
                            <Button
                                size="icon"
                                className="sm:hidden rounded-full h-10 w-10"
                            >
                                <ButtonIcon className="h-5 w-5" />
                            </Button>
                            <Button className="hidden sm:flex items-center gap-2">
                                <ButtonIcon className="w-4 h-4" />
                                <span>{buttonLabel}</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
            {children}
        </AuthenticatedLayout>
    );
}
