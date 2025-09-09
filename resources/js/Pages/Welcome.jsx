import { Link, Head } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Feather, LogIn } from "lucide-react";

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Selamat Datang" />
            <div className="relative min-h-screen flex flex-col items-center justify-center bg-background selection:bg-primary selection:text-primary-foreground p-4">
                <div className="absolute top-0 right-0 p-6">
                    {auth.user ? (
                        <Link href={route("dashboard")}>
                            <Button variant="outline">Dashboard</Button>
                        </Link>
                    ) : (
                        <div className="space-x-4">
                            <Link href={route("login")}>
                                <Button className="gap-2">
                                    <LogIn className="h-4 w-4" />
                                    Masuk
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="max-w-2xl text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-primary/10 rounded-2xl">
                            <div className="p-4 bg-primary/20 rounded-xl">
                                <Feather className="h-12 w-12 text-primary" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
                        Selamat Datang di{" "}
                        <span className="text-primary">Inventory System!</span>
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto">
                        Sistem manajemen inventaris yang efisien untuk bisnis
                        Anda. Dengan ini, pekerjaan anda menjadi lebih mudah.
                    </p>
                </div>

                <div className="absolute bottom-6 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Inventory.System - All rights
                    reserved.
                </div>
            </div>
        </>
    );
}
