import { useState, useEffect } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

type AuthUser = {
    id?: number | string;
};

type AuthState = {
    user?: AuthUser;
};

type NotificationData = {
    icon?: string;
    type?: string;
    title?: string;
    message?: string;
    action_url?: string;
    [key: string]: unknown;
};

type NotificationItem = {
    id: number | string;
    read_at?: string | null;
    data: NotificationData;
    created_at: string;
    type?: string;
};

async function fetchApiNotifications(
    setNotifications: (items: NotificationItem[]) => void,
    setUnreadCount: (count: number) => void
) {
    try {
        const response = await axios.get(route('notifications.api'));
        const responsePayload = response.data?.data;
        const fetchedNotifications = (Array.isArray(responsePayload?.data)
            ? responsePayload.data
            : Array.isArray(responsePayload)
            ? responsePayload
            : []) as NotificationItem[];
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter((n) => !n.read_at).length);
    } catch {
        // Silently handled
    }
}

function parseIncomingNotification(notification: any): NotificationItem {
    const notifData = notification.data || notification;
    return {
        id: notification.id ?? `${Date.now()}`,
        type: notification.type,
        data: notifData,
        read_at: null,
        created_at: notification.created_at || new Date().toISOString(),
    };
}

export default function useNotifications(auth?: AuthState, setIsOpen?: (open: boolean) => void) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchApiNotifications(setNotifications, setUnreadCount);
        const userId = auth?.user?.id;
        if (!userId || !window.Echo) return;

        const channel = window.Echo.private(`App.Models.User.${userId}`);
        channel.notification((event: any) => {
            const newItem = parseIncomingNotification(event);
            setNotifications((prev) => [newItem, ...prev]);
            setUnreadCount((prev) => prev + 1);
            if (newItem.data.title || newItem.data.message) {
                toast.info(newItem.data.title || newItem.data.message, {
                    description: newItem.data.title && newItem.data.message ? newItem.data.message : undefined,
                });
            }
        });

        return () => {
            window.Echo.leave(`App.Models.User.${userId}`);
        };
    }, [auth?.user?.id]);

    const handleMarkAsRead = (notification: NotificationItem) => {
        if (!notification.read_at) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
            axios.post(route('notifications.read', notification.id)).catch(() => {});
        }

        if (notification.data.action_url) {
            if (setIsOpen) setIsOpen(false);
            router.visit(notification.data.action_url);
        }
    };

    const handleMarkAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
        setUnreadCount(0);
        axios.post(route('notifications.readAll')).catch(() => {});
    };

    return { notifications, unreadCount, handleMarkAsRead, handleMarkAllRead };
}
