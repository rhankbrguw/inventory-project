import axios from "axios";
import { toast } from "sonner";

window.axios = axios;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

window.axios.defaults.withCredentials = true;

const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
    console.log("✅ CSRF Token set");
} else {
    console.error("❌ CSRF token not found");
}

import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? "ap1",
    forceTLS: true,
    encrypted: true,
    authEndpoint: "/broadcasting/auth",

    authorizer: (channel) => {
        return {
            authorize: (socketId, callback) => {
                console.log("🔐 Auth attempt:", {
                    channel: channel.name,
                    socketId: socketId,
                    hasCSRF: !!token,
                });

                window.axios
                    .post(
                        "/broadcasting/auth",
                        {
                            socket_id: socketId,
                            channel_name: channel.name,
                        },
                        {
                            headers: {
                                "X-CSRF-TOKEN": token ? token.content : "",
                                "X-Requested-With": "XMLHttpRequest",
                            },
                            withCredentials: true,
                        },
                    )
                    .then((response) => {
                        console.log("✅ Auth success:", response.status);
                        callback(null, response.data);
                    })
                    .catch((error) => {
                        console.error("❌ Auth failed:", {
                            status: error.response?.status,
                            data: error.response?.data,
                            message: error.message,
                        });
                        callback(error);
                    });
            },
        };
    },
});

window.Echo.connector.pusher.connection.bind("connected", () => {
    console.log("✅ Pusher Connected! Socket:", window.Echo.socketId());
});

window.Echo.connector.pusher.connection.bind("error", (err) => {
    console.error("❌ Pusher Error:", err);
});

window.Echo.connector.pusher.connection.bind("state_change", (states) => {
    console.log("🔄 State:", states.current);
});

window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        if (response && response.status !== 422) {
            let title = `Error ${response.status}`;
            let description =
                response.data?.message || "Terjadi kesalahan sistem.";

            if (response.status === 419) {
                title = "Sesi Berakhir";
                description = "Halaman akan dimuat ulang...";
                setTimeout(() => window.location.reload(), 2000);
            }

            toast.error(title, { description });
        }

        return Promise.reject(error);
    },
);
