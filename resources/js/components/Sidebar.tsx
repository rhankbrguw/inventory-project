import { Link } from '@inertiajs/react';
import type React from 'react';
import useTranslation from '@/hooks/useTranslation';
import { usePermission } from '@/hooks/usePermission';
import { getNavLinks } from '@/constants/navLinks';
import ApplicationLogo from '@/components/ApplicationLogo';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SidebarProps = {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
};

type NavLinkProps = {
    href: string;
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
};

const NavLink = ({ href, active, children, onClick }: NavLinkProps) => (
    <Link
        href={href}
        onClick={onClick}
        className={`flex items-center px-3 py-2 rounded-lg transition-all text-xs sm:text-sm font-medium ${
            active
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        }`}
    >
        {children}
    </Link>
);

export default function Sidebar({
    sidebarOpen,
    setSidebarOpen,
}: SidebarProps) {
    const { t } = useTranslation();
    const { user, can } = usePermission();

    if (!user) return null;

    const navLinks = getNavLinks(t, can);

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r flex flex-col transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 shadow-lg lg:shadow-none`}
        >
            <div className="h-16 flex items-center justify-between px-4 border-b">
                <Link
                    href={route('dashboard')}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                >
                    <ApplicationLogo className="w-8 h-8 shrink-0" />
                    <span className="text-sm font-bold tracking-tight text-foreground truncate">
                        Inventory System
                    </span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navLinks
                    .filter((link) => link.show)
                    .map((link) => (
                        <NavLink
                            key={link.href}
                            href={link.href}
                            active={link.current}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <link.icon className="w-4 h-4 mr-2.5 shrink-0" />
                            <span>{link.name}</span>
                        </NavLink>
                    ))}
            </nav>
        </aside>
    );
}
