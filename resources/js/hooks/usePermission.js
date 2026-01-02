import { usePage } from "@inertiajs/react";

export function usePermission() {
    const { auth } = usePage().props;
    const user = auth.user;

    const defs = auth.role_definitions || {
        SUPER_ADMIN: 1,
        THRESHOLD_MANAGERIAL: 10,
        THRESHOLD_STAFF: 20,
    };

    if (!user) {
        return {
            isSuperAdmin: false,
            isManager: false,
            isOperational: false,
            level: 999,
        };
    }

    const isSuperAdmin = user.level === defs.SUPER_ADMIN;
    const isManager = user.level <= defs.THRESHOLD_MANAGERIAL;
    const isOperational = user.level <= defs.THRESHOLD_STAFF;

    return {
        user,
        level: user.level,
        isSuperAdmin,
        isManager,
        isOperational,

        canManage: isManager,
        canOperate: isOperational,
    };
}
