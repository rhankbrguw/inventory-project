import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TransactionPaymentBadge({
    installmentTerms,
    paymentStatus,
    hasInstallments,
}) {
    const getPaymentText = () => {
        if (installmentTerms === 1) return "Lunas";
        return `Cicilan ${installmentTerms}x`;
    };

    const getStatusBadge = () => {
        if (!hasInstallments) return null;

        const statusConfig = {
            paid: {
                text: "Lunas",
                variant: "default",
                className: "bg-success/10 text-success border-success/20",
            },
            partial: {
                text: "Sebagian",
                variant: "secondary",
                className: "",
            },
            unpaid: {
                text: "Belum Bayar",
                variant: "outline",
                className: "",
            },
        };

        const config = statusConfig[paymentStatus] || statusConfig.unpaid;

        return (
            <Badge variant={config.variant} className={cn(config.className)}>
                {config.text}
            </Badge>
        );
    };

    return (
        <div className="flex items-center gap-2">
            <span className="font-semibold">{getPaymentText()}</span>
            {getStatusBadge()}
        </div>
    );
}
