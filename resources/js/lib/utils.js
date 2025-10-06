import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
    const numberAmount = Number(amount);
    if (isNaN(numberAmount)) {
        return "Rp0";
    }
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numberAmount);
}

export function formatDate(isoString) {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (isNaN(date)) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
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
    return new Intl.NumberFormat("id-ID").format(numberValue);
}
