import { Link, Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { LogIn } from 'lucide-react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="relative min-h-screen flex flex-col items-center justify-center bg-background selection:bg-primary selection:text-primary-foreground">
                <div className="sm:fixed sm:top-0 sm:right-0 p-6 text-end w-full">
                    {auth.user ? (
                        <Link href={route('dashboard')}>
                            <Button variant="outline">Dashboard</Button>
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')}>
                                <Button variant="outline">Log in</Button>
                            </Link>

                            <Link href={route('register')} className="ms-4">
                                <Button>Register</Button>
                            </Link>
                        </>
                    )}
                </div>

                <div className="max-w-xl text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <div className="p-4 bg-primary/20 rounded-full">
                                <LogIn className="h-10 w-10 text-primary" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                        Selamat Datang di Inventory System
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Sistem Manajemen Inventaris Internal untuk bisnis Anda.
                    </p>
                </div>
            </div>
        </>
    );
}
