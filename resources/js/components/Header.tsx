import { usePage, router } from '@inertiajs/react';
import { Menu, Globe } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import NotificationDropdown from './NotificationDropdown';
import { UserDropdownMenu } from './UserDropdownMenu';
import { ThemeToggle } from '@/components/ThemeToggle';

type HeaderProps = {
    setSidebarOpen: (open: boolean) => void;
};

export default function Header({ setSidebarOpen }: HeaderProps) {
    const { props } = usePage<{ locale?: string }>();
    const currentLocale = props.locale || 'id';
    const switchLanguage = (locale: 'id' | 'en') =>
        router.post(
            route('locale.update'),
            { locale },
            { preserveScroll: true, preserveState: true, only: ['translations', 'locale'] }
        );

    return (
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 -mb-px">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="lg:hidden -ml-2" onClick={() => setSidebarOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2 font-mono">
                                    <Globe className="h-4 w-4" /><span className="uppercase">{currentLocale}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => switchLanguage('id')} className={currentLocale === 'id' ? 'bg-accent' : ''}>🇮🇩 Indonesia</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => switchLanguage('en')} className={currentLocale === 'en' ? 'bg-accent' : ''}>🇺🇸 English</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <NotificationDropdown />
                        <UserDropdownMenu />
                    </div>
                </div>
            </div>
        </header>
    );
}
