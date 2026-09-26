import { Link, usePage } from '@inertiajs/react';
import { LogOut, User as ProfileIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import UnifiedBadge from './UnifiedBadge';

import useTranslation from '@/hooks/useTranslation';

type AuthUser = {
    name: string;
    email: string;
    role?: { name?: string | null } | null;
};

type UserPageProps = {
    auth: {
        user?: AuthUser | null;
    };
};

export function UserAvatar({ user }: { user: AuthUser }) {
    return (
        <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-semibold text-base shadow">
                {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-status-online border-2 border-card rounded-full" />
        </div>
    );
}

export function UserDropdownMenu() {
    const { t } = useTranslation();
    const { auth } = usePage<UserPageProps>().props;
    const user = auth.user;

    if (!user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-auto w-auto p-0 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <UserAvatar user={user} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2" align="end" sideOffset={10}>
                <DropdownMenuLabel className="px-2 py-2">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-foreground leading-tight">{user.name}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{user.email}</p>
                        <div className="pt-1"><UnifiedBadge text={user.role?.name} /></div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={route('profile.edit')}>
                    <DropdownMenuItem className="group cursor-pointer rounded-lg px-3 py-2 text-sm">
                        <ProfileIcon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        <span className="font-medium text-foreground">{t('ui.profile')}</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href={route('logout')} method="post" as="button" className="w-full">
                    <DropdownMenuItem className="group cursor-pointer rounded-lg px-3 py-2 text-sm text-destructive focus:text-destructive">
                        <LogOut className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-destructive" />
                        <span className="font-medium">{t('ui.logout')}</span>
                    </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
