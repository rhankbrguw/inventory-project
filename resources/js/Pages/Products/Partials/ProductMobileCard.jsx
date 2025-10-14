import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package } from "lucide-react";

export default function ProductMobileCard({ product, renderActionDropdown }) {
    return (
        <Card key={product.id}>
            <CardHeader className="flex flex-row items-center justify-between">
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
                        <CardTitle className="text-sm font-medium">
                            {product.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            SKU: {product.sku}
                        </p>
                        <p className="text-xs font-semibold">
                            {product.type ? product.type.name : "No Type"}
                        </p>
                    </div>
                </div>
                {renderActionDropdown && renderActionDropdown(product)}
            </CardHeader>
            <CardContent>
                <div className="text-lg font-bold">
                    {formatCurrency(product.price)} / {product.unit}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Ditambahkan: {formatDate(product.created_at)}
                </p>
            </CardContent>
        </Card>
    );
}
