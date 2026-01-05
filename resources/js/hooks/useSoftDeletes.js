import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';

export const useSoftDeletes = ({ resourceName, data }) => {
    const [confirmingDeletion, setConfirmingDeletion] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const itemToDeactivate = useMemo(
        () => data.find((item) => item.id === confirmingDeletion),
        [data, confirmingDeletion]
    );

    const safeSetProcessing = useCallback((value) => {
        if (isMountedRef.current) {
            setIsProcessing(value);
        }
    }, []);

    const deactivateItem = useCallback(() => {
        if (!confirmingDeletion) return;

        setIsProcessing(true);
        router.delete(route(`${resourceName}.destroy`, confirmingDeletion), {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                if (isMountedRef.current) {
                    setConfirmingDeletion(null);
                    setIsProcessing(false);
                }
            },
            onError: () => safeSetProcessing(false),
            onFinish: () => safeSetProcessing(false),
        });
    }, [confirmingDeletion, resourceName, safeSetProcessing]);

    const restoreItem = useCallback(
        (itemId) => {
            setIsProcessing(true);
            router.post(
                route(`${resourceName}.restore`, itemId),
                {},
                {
                    preserveScroll: true,
                    preserveState: false,
                    onFinish: () => safeSetProcessing(false),
                }
            );
        },
        [resourceName, safeSetProcessing]
    );

    return {
        confirmingDeletion,
        setConfirmingDeletion,
        isProcessing,
        itemToDeactivate,
        deactivateItem,
        restoreItem,
    };
};
