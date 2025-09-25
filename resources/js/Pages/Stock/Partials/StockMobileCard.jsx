import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import { Package, Warehouse } from "lucide-react";

const renderLocationIcon = (locType) => {
    if (locType === "warehouse") {
        return <Warehouse className="w-4 h-4 mr-2 text-muted-foreground" />;
    }
    return <Package className="w-4 h-4 mr-2 text-muted-foreground" />;
};

export default function StockMobileCard({ item }) {
    return (
        <Card key={item.id}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                    {item.product.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground font-mono">
                    {item.product.sku}
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                    {renderLocationIcon(item.location.type)}
                    {item.location.name}
                </div>
                <div className="text-lg font-bold mt-2">
                    {parseFloat(item.quantity).toLocaleString("id-ID")}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {item.product.unit}
                    </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                    Aktivitas Terakhir: {formatRelativeTime(item.updated_at)}
                </div>
            </CardContent>
        </Card>
    );
}
