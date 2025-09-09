import { Link } from "@inertiajs/react";
import { LogOut, Menu, User as ProfileIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "./ui/button";

const UserAvatar = ({ user }) => (
    <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center font-semibold text-lg shadow-md ring-2 ring-background/20">
            {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
    </div>
);

const MobileMenuButton = ({ onClick }) => (
    <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent"
        onClick={onClick}
    >
        <Menu className="w-6 h-6" />
        <span className="sr-only">Open navigation menu</span>
    </Button>
);

const UserDropdownMenu = ({ user }) => (
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
            className="w-64 p-2 bg-popover/95 backdrop-blur-md border-border/50 shadow-xl rounded-xl"
            align="end"
            sideOffset={12}
        >
            <DropdownMenuLabel className="px-2 py-2">
                <div className="flex items-center space-x-3">
                    <UserAvatar user={user} />
                    <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold text-foreground leading-tight">
                            {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground leading-tight">
                            {user.email}
                        </p>
                    </div>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <Link href={route("profile.edit")}>
                <DropdownMenuItem className="group cursor-pointer rounded-lg px-3 py-2 text-sm">
                    <ProfileIcon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    <span className="font-medium text-foreground">Profile</span>
                </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="my-1" />
            <Link
                href={route("logout")}
                method="post"
                as="button"
                className="w-full"
            >
                <DropdownMenuItem className="group cursor-pointer rounded-lg px-3 py-2 text-sm hover:!bg-destructive/10">
                    <LogOut className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-destructive" />
                    <span className="font-medium text-foreground group-hover:text-destructive">
                        Log out
                    </span>
                </DropdownMenuItem>
            </Link>
        </DropdownMenuContent>
    </DropdownMenu>
);

export default function Header({ user, setSidebarOpen }) {
    return (
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/60">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <MobileMenuButton
                        onClick={() => setSidebarOpen((prev) => !prev)}
                    />
                    <div className="flex-1"></div>
                    <div className="flex items-center space-x-4">
                        <UserDropdownMenu user={user} />
                    </div>
                </div>
            </div>
        </header>
    );
}
