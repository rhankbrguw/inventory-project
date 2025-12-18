import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { startOfDay } from "date-fns";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const getNormalizedDate = (date) => {
    if (!date) {
        return startOfDay(new Date());
    }

    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Date(date + "T00:00:00");
    }

    const d = date instanceof Date ? date : new Date(date);
    return startOfDay(d);
};

export function formatCurrency(amount) {
    const numberAmount = Number(amount);
    if (isNaN(numberAmount)) {
        return "Rp0";
    }
    const hasDecimal = numberAmount % 1 !== 0;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: hasDecimal ? 2 : 0,
    }).format(numberAmount);
}

export function formatDate(dateString) {
    if (!dateString) return "-";

    if (
        typeof dateString === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ) {
        const [year, month, day] = dateString.split("-");
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "Mei",
            "Jun",
            "Jul",
            "Agu",
            "Sep",
            "Okt",
            "Nov",
            "Des",
        ];

        return `${day} ${months[parseInt(month) - 1]} ${year}`;
    }

    const date = new Date(dateString);
    if (isNaN(date)) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatTime(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(date);
}

export function formatRelativeTime(isoString) {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    if (seconds < 60) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
}

export function formatGroupName(groupName) {
    if (!groupName) return "";
    return groupName
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function formatNumber(value) {
    const numberValue = Number(value);
    if (isNaN(numberValue)) {
        return "0";
    }
    if (numberValue % 1 === 0) {
        return numberValue.toLocaleString("id-ID", {
            useGrouping: true,
            maximumFractionDigits: 0,
        });
    }
    return numberValue.toLocaleString("id-ID", {
        useGrouping: true,
        maximumFractionDigits: 4,
        minimumFractionDigits: 0,
    });
}

export function generateHslColorFromString(str) {
    if (!str) return {};
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return {
        backgroundColor: `hsl(${h}, 70%, 85%)`,
        color: `hsl(${h}, 70%, 25%)`,
    };
}
