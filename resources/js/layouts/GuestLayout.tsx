import { motion } from 'framer-motion';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';

type GuestLayoutProps = {
    children: React.ReactNode;
};

export default function Guest({ children }: GuestLayoutProps) {
    const { locale } = usePage<{ locale?: string }>().props;
    const currentLocale = String(locale || 'id');

    const switchLanguage = (lang: string) => {
        router.post(route('locale.update'), { locale: lang }, { preserveScroll: true, preserveState: true, only: ['translations', 'locale'] });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex flex-col items-center justify-center p-4 relative">
            <div className="absolute top-0 right-0 p-4 sm:p-6 flex items-center gap-2">
                <ThemeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 font-mono">
                            <Globe className="h-4 w-4" />
                            <span className="uppercase">{currentLocale}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => switchLanguage('id')}
                            className={currentLocale === 'id' ? 'bg-accent' : ''}
                        >
                            🇮🇩 Indonesia
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => switchLanguage('en')}
                            className={currentLocale === 'en' ? 'bg-accent' : ''}
                        >
                            🇺🇸 English
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md md:max-w-lg"
            >
                {children}
            </motion.div>

            <Toaster />
        </div>
    );
}
