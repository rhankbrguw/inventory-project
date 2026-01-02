import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UnifiedBadge from "@/components/UnifiedBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { router } from "@inertiajs/react";

export default function TransactionMobileCard({
    transaction,
    renderActionDropdown,
}) {
    const isTransfer = transaction.type === "Transfer";
    const statusVariant =
        {
            pending: "warning",
            completed: "success",
            rejected: "destructive",
        }[transaction.status] || "default";

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-mono">
                        {transaction.reference_code}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.transaction_date)}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <UnifiedBadge text={transaction.type} />
                    {isTransfer && (
                        <Badge variant={statusVariant}>
                            {transaction.status}
                        </Badge>
                    )}
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
