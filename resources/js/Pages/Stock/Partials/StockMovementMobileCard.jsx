import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { formatDate, formatNumber, formatTime } from "@/lib/utils";
import { Link } from "@inertiajs/react";

export default function StockMovementMobileCard({ movement }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Badge variant="outline" className="capitalize">
                    {movement.type}
                </Badge>
                <p
                    className={`font-semibold ${
                        movement.quantity > 0
                            ? "text-success"
                            : "text-destructive"
                    }`}
                >
                    {movement.quantity > 0 ? "+" : ""}
                    {formatNumber(movement.quantity)}
                </p>
            </CardHeader>
            <CardContent className="text-sm">
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                        {formatDate(movement.created_at)} at{" "}
                        {formatTime(movement.created_at)}
                    </p>
                    <p className="font-mono">
                        Ref:{" "}
                        {movement.reference ? (
                            <Link
                                href={movement.reference.url}
                                className="text-primary hover:underline"
                            >
                                {movement.reference.code}
                            </Link>
                        ) : (
                            movement.notes || "-"
                        )}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
