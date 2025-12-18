import axios from 'axios';
import { toast } from 'sonner';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
    wsHost: import.meta.env.VITE_PUSHER_HOST ? import.meta.env.VITE_PUSHER_HOST : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
    wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
    wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});

window.axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const { response } = error;

        console.groupCollapsed(
            `%c SYSTEM ERROR: ${response ? response.status : 'NETWORK_FAILURE'}`,
            'color: white; background-color: #ef4444; padding: 2px 5px; border-radius: 2px; font-weight: bold;'
        );

        if (response) {
            console.log('📍 Endpoint:', response.config.url);
            console.log('📦 Status Code:', response.status);
            console.log('📝 Server Message:', response.data.message || error.message);

            if (response.data.exception) {
                console.log('🐛 Exception:', response.data.exception);
                if (response.data.file) {
                    console.log('📂 File:', `${response.data.file}:${response.data.line}`);
                }
            }

            console.log('🔍 Full Response:', response.data);

            if (response.status !== 422) {
                let title = `Error ${response.status}`;
                let description = response.data.message || 'Terjadi kesalahan sistem.';

                if (response.status === 403) {
                    title = 'Akses Ditolak';
                    description = response.data.message || 'Anda tidak memiliki izin.';
                } else if (response.status === 404) {
                    title = 'Tidak Ditemukan';
                } else if (response.status === 500) {
                    title = 'Server Error';
                } else if (response.status === 419) {
                    title = 'Sesi Berakhir';
                    description = 'Halaman akan dimuat ulang...';
                    setTimeout(() => window.location.reload(), 2000);
                }

                toast.error(title, {
                    description: description,
                    duration: 5000,
                    style: {
                        background: '#fee2e2',
                        border: '1px solid #f87171',
                        color: '#991b1b'
                    }
                });
            }

        } else if (error.request) {
            console.error('❌ No response received from server (Network Error).');
            console.error(error.request);

            toast.error('Koneksi Gagal', {
                description: 'Tidak dapat menghubungi server. Periksa koneksi internet Anda.',
            });
        } else {
            console.error('❌ Request Setup Error:', error.message);
        }

        console.groupEnd();

        return Promise.reject(error);
    }
);
