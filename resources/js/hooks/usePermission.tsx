import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types/global';

const DEFAULT_ROLE_DEFS = {
    SUPER_ADMIN: 1,
    THRESHOLD_MANAGERIAL: 10,
    THRESHOLD_STAFF: 20,
};

const DEFAULT_GUEST_PERMISSIONS = {
    user: null,
    can: {} as Record<string, boolean>,
    isSuperAdmin: false,
    isManager: false,
    isOperational: false,
    level: 999,
    canManage: false,
    canOperate: false,
};

export function usePermission() {
    const { auth } = usePage<PageProps<{ auth: { user?: { level?: number; [key: string]: unknown }; can?: Record<string, boolean>; role_definitions?: Record<string, number> } }>>().props;
    const user = auth?.user;
    const can = auth?.can || {};
    const defs = auth?.role_definitions || DEFAULT_ROLE_DEFS;

    if (!user) {
        return DEFAULT_GUEST_PERMISSIONS;
    }

    const isSuperAdmin = user.level === defs.SUPER_ADMIN;
    const isManager = (user.level ?? 999) <= defs.THRESHOLD_MANAGERIAL;
    const isOperational = (user.level ?? 999) <= defs.THRESHOLD_STAFF;

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
