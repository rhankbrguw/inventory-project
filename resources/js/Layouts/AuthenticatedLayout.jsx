import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Header from '@/Components/Header';

export default function Authenticated({ user, title, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen flex bg-background">
                <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="flex-1 flex flex-col">
                    <Header user={user} setSidebarOpen={setSidebarOpen} />
                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
