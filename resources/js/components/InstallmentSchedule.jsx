import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function InstallmentSchedule({ installments, paymentStatus }) {
    if (!installments || installments.length === 0) {
        return null;
    }

    const getStatusBadge = (installment) => {
        if (installment.is_paid) {
            return (
                <Badge className="gap-1 bg-success/10 text-success border-success/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Lunas
                </Badge>
            );
        }
        if (installment.is_overdue) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Jatuh Tempo
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                Belum Bayar
            </Badge>
        );
    };

    const totalPaid = installments.reduce(
        (sum, inst) => sum + parseFloat(inst.paid_amount || 0),
        0,
    );
    const totalAmount = installments.reduce(
        (sum, inst) => sum + parseFloat(inst.amount),
        0,
    );
    const paidCount = installments.filter((inst) => inst.is_paid).length;

    const getPaymentStatusBadge = () => {
        if (paymentStatus === "paid") {
            return (
                <Badge className="text-xs bg-success/10 text-success border-success/20">
                    {paidCount} / {installments.length} Terbayar
                </Badge>
            );
        }
        if (paymentStatus === "partial") {
            return (
                <Badge variant="secondary" className="text-xs">
                    {paidCount} / {installments.length} Terbayar
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="text-xs">
                {paidCount} / {installments.length} Terbayar
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Jadwal Cicilan ({installments.length}x)
                    </CardTitle>
                    {getPaymentStatusBadge()}
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">
                            Progress Pembayaran
                        </span>
                        <span className="font-semibold">
                            {formatCurrency(totalPaid)} /{" "}
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-500 rounded-full",
                                paymentStatus === "paid"
                                    ? "bg-[hsl(var(--success))]"
                                    : "bg-primary",
                            )}
                            style={{
                                width: `${(totalPaid / totalAmount) * 100}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {installments.map((installment) => (
                        <div
                            key={installment.id}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-lg border transition-colors",
                                installment.is_paid
                                    ? "bg-success/5 border-success/20"
                                    : installment.is_overdue
                                        ? "bg-destructive/5 border-destructive/20"
                                        : "bg-card hover:bg-muted/50",
                            )}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">
                                        Cicilan ke-
                                        {installment.installment_number}
                                    </span>
                                    {getStatusBadge(installment)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Jatuh Tempo:{" "}
                                    {formatDate(installment.due_date)}
                                    {installment.paid_date && (
                                        <span className="ml-2">
                                            • Dibayar:{" "}
                                            {formatDate(installment.paid_date)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-base">
                                    {formatCurrency(installment.amount)}
                                </div>
                                {installment.is_paid && (
                                    <div className="text-xs text-[hsl(var(--success))]">
                                        ✓ Terbayar
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
