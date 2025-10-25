import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatNumber, formatTime } from "@/lib/utils";
import { Link } from "@inertiajs/react";
import { cn } from "@/lib/utils";

export default function StockMovementMobileCard({ movement }) {
    const isPositive = movement.quantity > 0;

    const renderKeterangan = () => {
        const od = movement.origin_destination;
        if (movement.type === "adjustment") {
            return od?.name || "-";
        }
        if (od?.name) {
            return `${od.label} ${od.name}`;
        }
        if (movement.reference?.code) {
            return (
                <Link
                    href={movement.reference.url}
                    className="text-primary hover:underline font-mono"
                    onClick={(e) => e.stopPropagation()}
                >
                    {movement.reference.code}
                </Link>
            );
        }
        return movement.notes || "-";
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium leading-none">
                        {movement.product?.name || "Produk Dihapus"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">
                        {movement.product?.sku || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Lokasi: {movement.location?.name || "-"}
                    </p>
                </div>
                <div
                    className={cn(
                        "text-lg font-bold whitespace-nowrap",
                        isPositive ? "text-success" : "text-destructive",
                    )}
                >
                    {isPositive ? "+" : ""}
                    {formatNumber(movement.quantity)}
                </div>
            </CardHeader>
            <CardContent className="text-sm pt-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="capitalize">
                        {movement.type.replace("_", " ")}
                    </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>Keterangan: {renderKeterangan()}</p>
                    <p>
                        Waktu: {formatDate(movement.created_at)} -{" "}
                        {formatTime(movement.created_at)}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
