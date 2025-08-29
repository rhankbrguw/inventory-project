import { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Sidebar";
import Header from "@/Components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

export default function AuthenticatedLayout({ user, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { flash } = usePage().props;

    return (
        <>
            <div className="flex h-screen bg-background overflow-hidden">
                <Sidebar user={user} sidebarOpen={sidebarOpen} />
                <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    <Header user={user} setSidebarOpen={setSidebarOpen} />
                    {header && (
                        <header className="bg-white shadow-sm">
                            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}
                    <main className="flex-1">
                        <div className="py-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {flash && flash.success && (
                                <Alert className="mb-4 border-green-500 text-green-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertTitle>Success</AlertTitle>
                                    <AlertDescription>
                                        {flash.success}
                                    </AlertDescription>
                                </Alert>
                            )}
                            {flash && flash.error && (
                                <Alert variant="destructive" className="mb-4">
                                    <XCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{flash.error}</AlertDescription>
                                </Alert>
                            )}
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
