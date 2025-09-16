import { Link, Head } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Feather, LogIn } from "lucide-react";

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Selamat Datang" />
            <div className="relative min-h-screen flex flex-col items-center justify-center bg-background selection:bg-primary selection:text-primary-foreground p-3">
                <div className="absolute top-0 right-0 p-3 sm:p-6">
                    {auth.user ? (
                        <Link href={route("dashboard")}>
                            <Button variant="outline" size="sm">
                                Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <Link href={route("login")}>
                            <Button size="sm" className="gap-1 text-sm">
                                <LogIn className="h-3 w-3" />
                                Masuk
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="max-w-xs sm:max-w-2xl text-center px-2">
                    <div className="flex justify-center mb-4">
                        <div className="p-2 sm:p-4 bg-primary/10 rounded-xl sm:rounded-2xl">
                            <div className="p-2 sm:p-4 bg-primary/20 rounded-lg sm:rounded-xl">
                                <Feather className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
                        Selamat Datang di{" "}
                        <span className="text-primary">Inventory System!</span>
                    </h1>

                    <p className="mt-3 sm:mt-6 text-sm sm:text-lg text-muted-foreground max-w-xs sm:max-w-lg mx-auto leading-relaxed">
                        Sistem manajemen inventaris yang efisien untuk bisnis
                        Anda. Dengan ini, pekerjaan anda menjadi lebih mudah.
                    </p>
                </div>

                <div className="absolute bottom-3 sm:bottom-6 text-xs text-muted-foreground px-2 text-center">
                    © {new Date().getFullYear()} Inventory.System -{" "}
                    <b>All rights reserved.</b>
                </div>
            </div>
        </>
    );
}
