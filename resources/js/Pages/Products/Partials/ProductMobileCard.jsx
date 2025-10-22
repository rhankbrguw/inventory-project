import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { formatCurrency, formatDate, cn, formatNumber } from "@/lib/utils";
import { Badge } from "@/Components/ui/badge";
import { Package, PackageCheck } from "lucide-react";

export default function ProductMobileCard({ product, renderActionDropdown }) {
    const isInactive = !!product.deleted_at;

    return (
        <Card
            key={product.id}
            className={cn(isInactive && "opacity-50 bg-muted/50")}
        >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-4">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-14 w-14 rounded-md object-cover"
                        />
                    ) : (
                        <div className="h-14 w-14 rounded-md bg-secondary flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                    )}
                    <div className="space-y-1">
                        <CardTitle className="text-base font-medium leading-tight">
                            {product.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            SKU: {product.sku}
                        </p>
                    </div>
                </div>
                {renderActionDropdown && renderActionDropdown(product)}
            </CardHeader>
            <CardContent>
                <div className="text-lg font-bold">
                    {formatCurrency(product.price)} / {product.unit}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <PackageCheck className="w-3 h-3" />
                    <span>Stok: {formatNumber(product.total_stock)}</span>
                    <span className="mx-1">·</span>
                    <span>Ditambahkan: {formatDate(product.created_at)}</span>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={isInactive ? "destructive" : "success"}>
                        {isInactive ? "Nonaktif" : "Aktif"}
                    </Badge>
                    <Badge variant="outline">
                        {product.type?.name || "Tanpa Tipe"}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
