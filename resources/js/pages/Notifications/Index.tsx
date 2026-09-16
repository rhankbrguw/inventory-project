import React, { useState, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Bell, Truck, Info, AlertTriangle, CheckCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useTranslation from '@/hooks/useTranslation';

import EmptyState from '@/components/EmptyState';

export default function Index({ auth, initialNotifications }) {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState(initialNotifications.data);
    const [nextCursor, setNextCursor] = useState(initialNotifications.next_cursor);
    const [loading, setLoading] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    const getIcon = (type: string) => {
        if (type === 'Truck') return <Truck className="h-5 w-5 text-info" />;
        if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-warning" />;
        if (type === 'success') return <CheckCircle className="h-5 w-5 text-success" />;
        return <Info className="h-5 w-5 text-muted-foreground" />;
    };

    const loadMore = async () => {
        if (!nextCursor || loading) return;
        setLoading(true);
        try {
            const res = await axios.get(route('notifications.api', { cursor: nextCursor }));
            setNotifications((prev: any) => [...prev, ...res.data.data]);
            setNextCursor(res.data.next_cursor);
        } catch {
            // Handled
        } finally { setLoading(false); }
    };

    const lastElementRef = useCallback((node: HTMLElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && nextCursor) loadMore(); });
        if (node && observer.current) observer.current.observe(node);
    }, [loading, nextCursor]);

    const handleMarkAsRead = async (id) => {
        try {
            await axios.post(route('notifications.read', id));
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
        } catch {
            // Handled
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.post(route('notifications.readAll'));
            setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
        } catch {
            // Handled
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-foreground leading-tight">{t('ui.all_notifications')}</h2>}>
            <Head title={t('ui.notifications')} />
            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                        <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" /> {t('ui.notifications')}</CardTitle>
                        <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2"><Check className="h-4 w-4" /> {t('ui.mark_all_read')}</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {notifications.length === 0 ? (
                            <div className="py-12 px-4">
                                <EmptyState
                                    icon={Bell}
                                    title={t('ui.no_notifications')}
                                    description={t('ui.no_notifications_desc')}
                                />
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map((n, idx) => (
                                    <div ref={notifications.length === idx + 1 ? lastElementRef : null} key={n.id} className={`p-5 flex gap-4 transition-colors ${!n.read_at ? 'bg-accent/20' : 'bg-card hover:bg-accent/5'}`}>
                                        <div className="mt-1 shrink-0">{getIcon(n.data.icon || n.data.type)}</div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-base ${!n.read_at ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>{n.data.title}</p>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: localeId })}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{n.data.message}</p>
                                            {n.data.action_url && <div className="pt-2"><Link href={n.data.action_url}><Button size="sm" variant="secondary">{t('ui.view_detail')}</Button></Link></div>}
                                        </div>
                                        {!n.read_at && <div className="shrink-0 flex items-center ml-2"><Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(n.id)} title={t('ui.mark_as_read')}><Check className="h-4 w-4 text-primary" /></Button></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                        {loading && <div className="p-4 flex justify-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                        {!nextCursor && notifications.length > 0 && <div className="p-4 text-center text-sm text-muted-foreground">{t('ui.end_of_notifications')}</div>}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
