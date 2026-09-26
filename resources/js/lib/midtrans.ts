import { MIDTRANS_SDK_UNAVAILABLE } from '../constants/strings';

const SNAP_URL = import.meta.env.VITE_MIDTRANS_SNAP_URL ?? 'https://app.sandbox.midtrans.com/snap/snap.js';
const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY ?? '';

export function loadMidtransScript() {
    return new Promise((resolve, reject) => {
        if (window.snap) {
            resolve(window.snap);
            return;
        }

        const existingScript = document.getElementById('midtrans-snap-script');
        if (existingScript) {
            existingScript.onload = () => resolve(window.snap);
            return;
        }

        const script = document.createElement('script');
        script.id = 'midtrans-snap-script';
        script.src = SNAP_URL;

        if (CLIENT_KEY) {
            script.setAttribute('data-client-key', CLIENT_KEY);
        }

        script.onload = () => resolve(window.snap);
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
    });
}

type MidtransSnapCallbacks = {
    onSuccess?: (result: unknown) => void;
    onPending?: (result: unknown) => void;
    onError?: (result: unknown) => void;
    onClose?: () => void;
};

export async function openMidtransSnap(token: string, callbacks: MidtransSnapCallbacks = {}) {
    await loadMidtransScript();

    if (!window.snap) {
        throw new Error(MIDTRANS_SDK_UNAVAILABLE);
    }

    const { onSuccess, onPending, onError, onClose } = callbacks;
    window.snap.pay(token, {
        onSuccess: (result) => onSuccess?.(result),
        onPending: (result) => onPending?.(result),
        onError: (result) => onError?.(result),
        onClose: () => onClose?.(),
    });
}
