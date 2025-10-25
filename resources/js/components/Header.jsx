import { Link, usePage } from "@inertiajs/react";
import { LogOut, Menu, User as ProfileIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import UnifiedBadge from "./UnifiedBadge";

const UserAvatar = ({ user }) => (
    <div className="relative">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-semibold text-base shadow">
            {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-status-online border-2 border-card rounded-full"></div>
    </div>
);

const UserDropdownMenu = () => {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-auto w-auto p-0 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <UserAvatar user={user} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-64 p-2"
                align="end"
                sideOffset={10}
            >
                <DropdownMenuLabel className="px-2 py-2">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-foreground leading-tight">
                            {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground leading-tight">
                            {user.email}
                        </p>
                        <div className="pt-1">
                            <UnifiedBadge text={user.role?.name} />
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={route("profile.edit")}>
                    <DropdownMenuItem className="group cursor-pointer rounded-lg px-3 py-2 text-sm">
                        <ProfileIcon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        <span className="font-medium text-foreground">
                            Profile
                        </span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link
                    href={route("logout")}
                    method="post"
                    as="button"
                    className="w-full"
                >
                    <DropdownMenuItem className="group cursor-pointer rounded-lg px-3 py-2 text-sm text-destructive focus:text-destructive">
                        <LogOut className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-destructive" />
                        <span className="font-medium">Log out</span>
                    </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default function Header({ setSidebarOpen }) {
    return (
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 -mb-px">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden -ml-2"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                            <span className="sr-only">Buka Sidebar</span>
                        </Button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <UserDropdownMenu />
                    </div>
                </div>
            </div>
        </header>
    );
}
