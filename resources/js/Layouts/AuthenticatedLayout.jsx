import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Header from '@/Components/Header';
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Authenticated({ user, title, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { flash } = usePage().props;

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen flex bg-background">
                <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="flex-1 flex flex-col relative">
                    <Header user={user} setSidebarOpen={setSidebarOpen} />
                    <main className="flex-1 p-6">
                        {flash && flash.success && (
                            <Alert className="mb-4 border-green-500 text-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>{flash.success}</AlertDescription>
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
                    </main>
                </div>
            </div>
        </>
    );
}
