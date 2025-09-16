import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Sidebar";
import Header from "@/Components/Header";
import { Toaster, toast } from "sonner";

export default function AuthenticatedLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash && flash.success) {
            toast.success(flash.success);
        }
        if (flash && flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        <>
            <div className="relative min-h-screen lg:flex">
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="flex-1 flex flex-col lg:ml-64">
                    <Header setSidebarOpen={setSidebarOpen} />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
                        {children}
                    </main>
                </div>

                {sidebarOpen && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
                        aria-hidden="true"
                    ></div>
                )}
            </div>
            <Toaster richColors position="top-center" />
        </>
    );
}
