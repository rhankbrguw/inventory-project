import axios from 'axios';
import { toast } from 'sonner';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

window.axios.interceptors.request.use(
    (config) => {
        const token = getCookie('XSRF-TOKEN');
        if (token) {
            config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap1',
    forceTLS: true,
    encrypted: true,
    authEndpoint: '/broadcasting/auth',
    authorizer: (channel) => {
        return {
            authorize: (socketId, callback) => {
                window.axios
                    .post('/broadcasting/auth', {
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                    .then((response) => callback(null, response.data))
                    .catch((error) => callback(error));
            },
        };
    },
});

window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const response = error.response;

        if (!response) {
            toast.error('Network Error', {
                description:
                    'Gagal terhubung ke server. Cek koneksi internet Anda.',
            });
            return Promise.reject(error);
        }

        const status = response.status;

        if (status === 419 || status === 422) {
            return Promise.reject(error);
        }

        if (status === 401) {
        } else if (status >= 500) {
            toast.error('Server Error', {
                description:
                    response.data?.message || 'Terjadi kesalahan di server.',
            });
        }

        return Promise.reject(error);
    }
);
