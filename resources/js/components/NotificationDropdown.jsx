import { useState, useEffect } from "react";
import { Bell, Truck, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import { router, usePage } from "@inertiajs/react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function NotificationDropdown() {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(route("notifications.index"));
            setNotifications(response.data);
            setUnreadCount(response.data.filter((n) => !n.read_at).length);
        } catch (error) {
            console.error("Gagal memuat notifikasi", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const userId = auth?.user?.id;
        if (userId && window.Echo) {
            window.Echo.private(`App.Models.User.${userId}`).notification(
                (notification) => {
                    console.log("Received notification:", notification);

                    setNotifications((prev) => [
                        {
                            id: notification.id,
                            type: notification.type,
                            data: notification.data,
                            read_at: null,
                            created_at: notification.created_at,
                        },
                        ...prev,
                    ]);

                    setUnreadCount((prev) => prev + 1);
                },
            );
        }

        const interval = setInterval(fetchNotifications, 30000);

        return () => {
            clearInterval(interval);
            if (userId && window.Echo) {
                window.Echo.leave(`App.Models.User.${userId}`);
            }
        };
    }, [auth?.user?.id]);

    const handleMarkAsRead = async (notification) => {
        if (!notification.read_at) {
            try {
                await axios.post(route("notifications.read", notification.id));
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id
                            ? { ...n, read_at: new Date().toISOString() }
                            : n,
                    ),
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Error marking read", error);
            }
        }

        if (notification.data.action_url) {
            setIsOpen(false);
            router.visit(notification.data.action_url);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.post(route("notifications.readAll"));
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all read", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "Truck":
                return <Truck className="h-4 w-4 text-info" />;
            case "warning":
                return <AlertTriangle className="h-4 w-4 text-warning" />;
            case "success":
                return <CheckCircle className="h-4 w-4 text-success" />;
            default:
                return <Info className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive border-2 border-background"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 bg-popover border-border"
                align="end"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h4 className="font-semibold text-sm text-foreground">
                        Notifikasi
                    </h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 px-2 text-muted-foreground hover:text-foreground"
                            onClick={handleMarkAllRead}
                        >
                            Tandai semua dibaca
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Tidak ada notifikasi baru
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer flex gap-3 ${!notification.read_at
                                            ? "bg-accent/30"
                                            : "bg-card"
                                        }`}
                                    onClick={() =>
                                        handleMarkAsRead(notification)
                                    }
                                >
                                    <div className="mt-1 shrink-0">
                                        {getIcon(
                                            notification.data.icon ||
                                            notification.data.type,
                                        )}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <p
                                            className={`text-sm leading-none ${!notification.read_at
                                                    ? "font-semibold text-foreground"
                                                    : "font-medium text-muted-foreground"
                                                }`}
                                        >
                                            {notification.data.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.data.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/70 pt-1">
                                            {formatDistanceToNow(
                                                new Date(
                                                    notification.created_at,
                                                ),
                                                {
                                                    addSuffix: true,
                                                    locale: id,
                                                },
                                            )}
                                        </p>
                                    </div>
                                    {!notification.read_at && (
                                        <div className="shrink-0 self-center">
                                            <div className="h-2 w-2 rounded-full bg-destructive" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
