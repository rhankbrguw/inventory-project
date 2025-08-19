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
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-semibold text-lg shadow-md ring-2 ring-white/20">
            {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
    </div>
);

const MobileMenuButton = ({ onClick }) => (
    <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-primary/70 hover:text-primary hover:bg-secondary/10"
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
                className="relative h-auto w-auto p-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
                <UserAvatar user={user} />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
            className="w-64 p-2 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-xl"
            align="end"
            sideOffset={12}
        >
            <DropdownMenuLabel className="px-2 py-2">
                <div className="flex items-center space-x-3">
                    <UserAvatar user={user} />
                    <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold text-primary leading-tight">
                            {user.name}
                        </p>
                        <p className="text-xs text-primary/70 leading-tight">
                            {user.email}
                        </p>
                    </div>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem className="group cursor-pointer rounded-lg px-3 py-2 text-sm">
                <ProfileIcon className="mr-3 h-4 w-4 text-primary/70 group-hover:text-primary" />
                <span className="font-medium text-primary/90 group-hover:text-primary">
                    Profile
                </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <Link href={route("logout")} method="post" as="button" className="w-full">
                <DropdownMenuItem className="group cursor-pointer rounded-lg px-3 py-2 text-sm hover:!bg-red-50">
                    <LogOut className="mr-3 h-4 w-4 text-primary/70 group-hover:text-red-600" />
                    <span className="font-medium text-primary/90 group-hover:text-red-700">
                        Log out
                    </span>
                </DropdownMenuItem>
            </Link>
        </DropdownMenuContent>
    </DropdownMenu>
);

export default function Header({ user, setSidebarOpen }) {
    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/60">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <MobileMenuButton onClick={() => setSidebarOpen(true)} />
                    <div className="flex-1"></div>
                    <div className="flex items-center space-x-4">
                        <UserDropdownMenu user={user} />
                    </div>
                </div>
            </div>
        </header>
    );
}
