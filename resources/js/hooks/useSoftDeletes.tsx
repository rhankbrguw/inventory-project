import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';

type SoftDeletableItem = {
    id: string | number;
    [key: string]: unknown;
};

type UseSoftDeletesProps<T extends SoftDeletableItem> = {
    resourceName: string;
    items?: T[];
    data?: T[];
};

function performDestroy(
    resourceName: string,
    id: string | number,
    isMounted: () => boolean,
    onSuccess: () => void,
    onFinish: () => void
) {
    router.delete(route(`${resourceName}.destroy`, id), {
        preserveScroll: true,
        preserveState: false,
        onSuccess: () => {
            if (isMounted()) onSuccess();
        },
        onError: onFinish,
        onFinish,
    });
}

export function useSoftDeletes<T extends SoftDeletableItem>({ resourceName, items, data }: UseSoftDeletesProps<T>) {
    const itemList = items ?? data ?? [];
    const [confirmingDeletion, setConfirmingDeletion] = useState<string | number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => () => { isMountedRef.current = false; }, []);

    const itemToDeactivate = useMemo(
        () => itemList.find((item) => item.id === confirmingDeletion),
        [itemList, confirmingDeletion]
    );

    const safeSetProcessing = useCallback((val: boolean) => {
        if (isMountedRef.current) setIsProcessing(val);
    }, []);

    const deactivateItem = useCallback(() => {
        if (!confirmingDeletion) return;
        setIsProcessing(true);
        performDestroy(
            resourceName,
            confirmingDeletion,
            () => isMountedRef.current,
            () => {
                setConfirmingDeletion(null);
                setIsProcessing(false);
            },
            () => safeSetProcessing(false)
        );
    }, [confirmingDeletion, resourceName, safeSetProcessing]);

    const restoreItem = useCallback((itemId: string | number) => {
        setIsProcessing(true);
        router.post(route(`${resourceName}.restore`, itemId), {}, {
            preserveScroll: true,
            preserveState: false,
            onFinish: () => safeSetProcessing(false),
        });
    }, [resourceName, safeSetProcessing]);

    return {
        confirmingDeletion, setConfirmingDeletion, isProcessing,
        itemToDeactivate, deactivateItem, restoreItem,
    };
}
