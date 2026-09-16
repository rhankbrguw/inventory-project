import axios from 'axios';
import { toast } from 'sonner';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import type {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    return parts.length === 2 ? parts.pop()?.split(';').shift() : undefined;
}

window.axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getCookie('XSRF-TOKEN');
        if (token && config.headers) {
            config.headers.set('X-XSRF-TOKEN', decodeURIComponent(token));
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

window.Pusher = Pusher;

const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY || '6294ab76c614916010ac';
const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1';

try {
    if (pusherKey) {
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: pusherKey,
            cluster: pusherCluster,
            forceTLS: true,
            authEndpoint: '/broadcasting/auth',
        });
    }
} catch (e) {
    // Fallback gracefully if WebSocket cannot be established
}

window.axios.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<{ message?: string }>) => {
        if (axios.isCancel(error) || error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
            return Promise.reject(error);
        }

        const response = error.response;

        if (!response) {
            toast.error('Network Error', {
                description:
                    'Gagal terhubung ke server. Cek koneksi internet Anda.',
            });
            return Promise.reject(error);
        }

        const status = response.status;

        if (status === 419 || status === 422 || status === 401) {
            return Promise.reject(error);
        }

        if (status >= 500) {
            toast.error('Server Error', {
                description: response.data?.message || 'Terjadi kesalahan di server.',
            });
        }

        return Promise.reject(error);
    }
);
