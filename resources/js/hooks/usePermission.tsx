import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types/global';

export function usePermission() {
    const { auth } = usePage<PageProps<{ auth: { user?: { level?: number; [key: string]: unknown }; can?: Record<string, boolean>; role_definitions?: Record<string, number> } }>>().props;
    const user = auth?.user;
    const can = auth?.can || {};
    const defs = auth?.role_definitions || {
        SUPER_ADMIN: 1,
        THRESHOLD_MANAGERIAL: 10,
        THRESHOLD_STAFF: 20,
    };

    if (!user) {
        return {
            user: null,
            can: {},
            isSuperAdmin: false,
            isManager: false,
            isOperational: false,
            level: 999,
            canManage: false,
            canOperate: false,
        };
    }

    const isSuperAdmin = user.level === defs.SUPER_ADMIN;
    const isManager = user.level <= defs.THRESHOLD_MANAGERIAL;
    const isOperational = user.level <= defs.THRESHOLD_STAFF;

    return {
        user,
        can,
        level: user.level,
        isSuperAdmin,
        isManager,
        isOperational,
        canManage: isManager,
        canOperate: isOperational,
    };
}
