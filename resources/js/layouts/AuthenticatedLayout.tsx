import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import type React from 'react';
import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';

type AuthenticatedLayoutProps = {
    children: React.ReactNode;
    user?: unknown;
    header?: React.ReactNode;
};

export default function AuthenticatedLayout({
    children,
}: AuthenticatedLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                    />
                )}
            </div>

            <div className="print-hidden">
                <Toaster />
            </div>
        </>
    );
}
