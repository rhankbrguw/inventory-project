import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Plus } from "lucide-react";

export default function IndexPageLayout({
    auth,
    title,
    createRoute,
    buttonLabel,
    icon,
    children,
}) {
    const ButtonIcon = icon || Plus;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-foreground leading-tight">
                        {title}
                    </h2>
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
            }
        >
            <Head title={title} />
            {children}
        </AuthenticatedLayout>
    );
}
