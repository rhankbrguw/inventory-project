import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SupplierMobileCard({ supplier, renderActionDropdown }) {
    const isInactive = !!supplier.deleted_at;

    return (
        <Card
            key={supplier.id}
            className={cn(isInactive && "opacity-50 bg-muted/50")}
        >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base">{supplier.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {supplier.contact_person || "Tanpa koordinator"}
                    </p>
                </div>
                {renderActionDropdown && renderActionDropdown(supplier)}
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                    {supplier.email || "-"} | {supplier.phone || "-"}
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={isInactive ? "destructive" : "success"}>
                        {isInactive ? "Nonaktif" : "Aktif"}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
