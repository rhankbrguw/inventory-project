import type { AxiosInstance } from 'axios';
import type Echo from 'laravel-echo';
import type Pusher from 'pusher-js';

export type UserRole = {
    id?: number | string;
    name: string;
    level?: number;
    display_name?: string;
    [key: string]: unknown;
};

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role?: UserRole | null;
    assigned_locations?: Array<{ id: number; name: string }>;
    deleted_at?: string | null;
    [key: string]: unknown;
};

export type AuthProps = {
    user: AuthUser;
    can?: Record<string, boolean>;
    permissions?: string[];
    [key: string]: unknown;
};

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: AuthProps;
    flash?: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
        info?: string | null;
    };
    [key: string]: unknown;
};

declare global {
    interface Window {
        axios: AxiosInstance;
        Echo: Echo;
        Pusher: typeof Pusher;
        snap?: {
            pay: (
                token: string,
                options?: {
                    onSuccess?: (result: unknown) => void;
                    onPending?: (result: unknown) => void;
                    onError?: (result: unknown) => void;
                    onClose?: () => void;
                }
            ) => void;
        };
    }

    const route: typeof import('ziggy-js').route;
}

declare module '@inertiajs/core' {
    interface PagePropsCallback {
        auth: AuthProps;
        flash?: {
            success?: string | null;
            error?: string | null;
            warning?: string | null;
            info?: string | null;
        };
        [key: string]: unknown;
    }
}

export {};
