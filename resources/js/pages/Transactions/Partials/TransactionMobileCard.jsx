import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UnifiedBadge from "@/components/UnifiedBadge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { router } from "@inertiajs/react";

export default function TransactionMobileCard({
    transaction,
    renderActionDropdown,
}) {
    const isTransfer = transaction.type === "Transfer";

    const getStatusClass = (status) => {
        const statusMap = {
            completed: "status-completed",
            pending: "status-pending",
            rejected: "status-rejected",
            shipping: "status-shipping",
        };
        return statusMap[status?.toLowerCase()] || "status-pending";
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1.5">
                    <CardTitle className="text-sm font-mono">
                        {transaction.reference_code}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.transaction_date)}
                    </p>
                    {transaction.status && (
                        <Badge
                            className={cn(
                                "capitalize text-[9px] h-4 px-1.5 font-medium",
                                getStatusClass(transaction.status),
                            )}
                        >
                            {transaction.status}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <UnifiedBadge text={transaction.type} />
                    {renderActionDropdown(transaction)}
                </div>
            </CardHeader>
            <CardContent
                onClick={() => router.get(transaction.url)}
                className="cursor-pointer"
            >
                {!isTransfer && (
                    <div className="text-lg font-bold mb-2">
                        {formatCurrency(transaction.total_amount)}
                    </div>
                )}
                <div className="text-xs space-y-1">
                    <p>
                        Lokasi:{" "}
                        <span className="font-medium">
                            {transaction.location}
                        </span>
                    </p>
                    <p>
                        {transaction.party_type ||
                            (transaction.type === "Pembelian"
                                ? "Supplier"
                                : "Customer")}{" "}
                        <span className="font-medium">
                            {transaction.party_name || "-"}
                        </span>
                    </p>
                    <p>
                        PIC:{" "}
                        <span className="font-medium">{transaction.user}</span>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
