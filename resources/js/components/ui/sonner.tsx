import React, { useEffect } from 'react';
import { Toaster as SonnerToaster, toast } from 'sonner';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { APP_CONFIG } from '@/constants/config';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

type FlashPageProps = {
    flash?: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
        info?: string | null;
    };
    [key: string]: unknown;
};

export function Toaster({ ...props }: ToasterProps) {
    const { flash } = usePage<FlashPageProps>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return (
        <SonnerToaster
            position="top-right"
            closeButton
            duration={APP_CONFIG.TOAST_DURATION_MS}
            visibleToasts={3}
            className="toaster group"
            icons={{
                success: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
                error: <AlertCircle className="h-4 w-4 text-destructive shrink-0" />,
                warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
                info: <Info className="h-4 w-4 text-info shrink-0" />,
                loading: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />,
            }}
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-card/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-border/80 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:font-sans group-[.toaster]:text-sm group-[.toaster]:font-medium group-[.toaster]:tracking-tight group-[.toaster]:p-4 group-[.toaster]:gap-3',
                    title: 'group-[.toast]:font-semibold group-[.toast]:text-foreground group-[.toast]:text-sm',
                    description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-xs group-[.toast]:leading-relaxed group-[.toast]:mt-0.5',
                    actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:text-xs group-[.toast]:font-semibold group-[.toast]:px-3 group-[.toast]:py-2 group-[.toast]:shadow-sm group-[.toast]:transition-all hover:group-[.toast]:opacity-90',
                    cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:px-3 group-[.toast]:py-2 group-[.toast]:transition-all hover:group-[.toast]:text-foreground',
                    closeButton: 'group-[.toast]:bg-background/80 group-[.toast]:backdrop-blur-md group-[.toast]:border-border/60 group-[.toast]:text-muted-foreground hover:group-[.toast]:text-foreground group-[.toast]:rounded-lg group-[.toast]:transition-colors group-[.toast]:top-3 group-[.toast]:right-3',
                    success: 'group-[.toaster]:border-emerald-500/20 group-[.toaster]:dark:border-emerald-500/30',
                    error: 'group-[.toaster]:border-destructive/20 group-[.toaster]:dark:border-destructive/30',
                    warning: 'group-[.toaster]:border-amber-500/20 group-[.toaster]:dark:border-amber-500/30',
                    info: 'group-[.toaster]:border-info/20 group-[.toaster]:dark:border-info/30',
                },
            }}
            {...props}
        />
    );
}

export { toast };
