import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Plus } from "lucide-react";

export default function IndexPageLayout({
  auth,
  title,
  createRoute,
  buttonLabel,
  children,
}) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-foreground leading-tight">
            {title}
          </h2>
          <Link href={route(createRoute)}>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{buttonLabel}</span>
            </Button>
          </Link>
        </div>
      }
    >
      <Head title={title} />
      {children}
    </AuthenticatedLayout>
  );
}
