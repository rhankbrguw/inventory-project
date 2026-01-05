import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

export default function AuthenticatedLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { flash, errors } = usePage().props;

    useEffect(() => {
        if (flash && flash.success) {
            toast.success(flash.success);
        }
        if (flash && flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    useEffect(() => {
        const errorValues = Object.values(errors);
        if (errorValues.length > 0) {
            toast.error(errorValues[0]);
        }
    }, [errors]);

    return (
        <>
            <div className="relative min-h-screen lg:flex">
                <div className="print-hidden">
                    <Sidebar
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                </div>

                <div className="flex-1 flex flex-col lg:ml-64 print-full-width">
                    <div className="print-hidden">
                        <Header setSidebarOpen={setSidebarOpen} />
                    </div>
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
                        {children}
                    </main>
                </div>

                {sidebarOpen && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden print-hidden"
                        aria-hidden="true"
                    ></div>
                )}
            </div>

            <div className="print-hidden">
                <Toaster
                    richColors
                    position="top-right"
                    duration={2000}
                    visibleToasts={1}
                    toastOptions={{
                        classNames: {
                            toast: 'w-[90vw] sm:w-full mx-auto sm:mx-0 right-0 top-2 sm:top-0 rounded-xl shadow-lg',
                            title: 'text-sm font-bold',
                            description: 'text-xs',
                        },
                    }}
                />
            </div>
        </>
    );
}
