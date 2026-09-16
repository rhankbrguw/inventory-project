import { useState } from 'react';
import { Bell, Truck, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePage, Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import useNotifications from '@/hooks/useNotifications';
import useTranslation from '@/hooks/useTranslation';

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

function getNotificationIcon(type?: string) {
    switch (type) {
        case 'Truck': return <Truck className="h-4 w-4 text-info" />;
        case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
        case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
        default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
}

export default function NotificationDropdown() {
    const { auth } = usePage<{ auth?: { user?: { id?: number | string } } }>().props;
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, handleMarkAsRead, handleMarkAllRead } = useNotifications(auth, setIsOpen);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive border-2 border-background" />
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-popover border-border" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h4 className="font-semibold text-sm text-foreground">{t('ui.notifications')}</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="text-xs h-auto py-1 px-2 text-muted-foreground hover:text-foreground" onClick={handleMarkAllRead}>
                            {t('ui.mark_all_read')}
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">{t('ui.no_new_notifications')}</div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification: NotificationItem) => (
                                <div
                                    key={String(notification.id)}
                                    className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer flex gap-3 ${!notification.read_at ? 'bg-accent/30' : 'bg-card'}`}
                                    onClick={() => handleMarkAsRead(notification)}
                                >
                                    <div className="mt-1 shrink-0">{getNotificationIcon(notification.data.icon || notification.data.type)}</div>
                                    <div className="space-y-1 flex-1">
                                        <p className={`text-sm leading-none ${!notification.read_at ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>{notification.data.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.data.message}</p>
                                        <p className="text-[10px] text-muted-foreground/70 pt-1">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: id })}</p>
                                    </div>
                                    {!notification.read_at && <div className="shrink-0 self-center"><div className="h-2 w-2 rounded-full bg-destructive" /></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t border-border">
                    <Link href={route('notifications.index')} onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full text-sm text-primary hover:text-primary/90">{t('ui.view_all_notifications')}</Button>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
