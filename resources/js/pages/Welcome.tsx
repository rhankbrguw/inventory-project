import { Link, Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { LogIn, Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ApplicationLogo from '@/components/ApplicationLogo';
import useTranslation from '@/hooks/useTranslation';

export default function Welcome({ auth, locale }) {
    const { t } = useTranslation();
    const currentLocale = locale || 'id';

    const switchLanguage = (lang) => {
        router.post(
            route('locale.update'),
            { locale: lang },
            { preserveScroll: true }
        );
    };

    return (
        <>
            <Head title={t('ui.welcome')} />
            <div className="relative min-h-screen flex flex-col items-center justify-center bg-background selection:bg-primary selection:text-primary-foreground p-3">
                <div className="absolute top-0 right-0 p-3 sm:p-6 flex items-center gap-4">
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

                    {auth.user ? (
                        <Link href={route('dashboard')}>
                            <Button variant="outline" size="sm">
                                {t('ui.dashboard')}
                            </Button>
                        </Link>
                    ) : (
                        <Link href={route('login')}>
                            <Button size="sm" className="gap-1 text-sm">
                                <LogIn className="h-3 w-3" />
                                {t('ui.login')}
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="max-w-xs sm:max-w-2xl text-center px-4 space-y-4">
                    <div className="flex justify-center mb-2">
                        <ApplicationLogo className="w-20 h-20 sm:w-24 sm:h-24" />
                    </div>

                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
                        {t('ui.welcome_to')}{' '}
                        <span className="text-primary">Inventory System</span>
                    </h1>

                    <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        {t('ui.welcome_desc')}
                    </p>
                </div>

                <div className="absolute bottom-3 sm:bottom-6 text-xs text-muted-foreground px-2 text-center">
                    © {new Date().getFullYear()} Inventory.System -{' '}
                    <b>All rights reserved.</b>
                </div>
            </div>
        </>
    );
}
