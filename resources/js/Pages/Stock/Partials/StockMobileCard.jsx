import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { formatRelativeTime, formatNumber } from "@/lib/utils";
import { Package, Warehouse } from "lucide-react";

export default function StockMobileCard({ item, renderActionDropdown }) {
    const renderLocationIcon = (locType) => {
        if (locType === "warehouse") {
            return <Warehouse className="w-4 h-4 text-muted-foreground" />;
        }
        return <Package className="w-4 h-4 text-muted-foreground" />;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium leading-none">
                        {item.product.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">
                        {item.product.sku}
                    </p>
                </div>
                {renderActionDropdown(item)}
            </CardHeader>
            <CardContent>
                <div className="text-lg font-bold">
                    {formatNumber(item.quantity)}
                    <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                        {item.product.unit}
                    </span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                    {renderLocationIcon(item.location.type)}
                    <span className="ml-1.5">{item.location.name}</span>
                    <span className="mx-1.5">·</span>
                    <span>{formatRelativeTime(item.updated_at)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
