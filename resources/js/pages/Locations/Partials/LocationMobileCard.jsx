import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function LocationMobileCard({ location, renderActionDropdown }) {
    const isInactive = !!location.deleted_at;

    return (
        <Card className={cn(isInactive && "opacity-50 bg-muted/50")}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1.5">
                    <CardTitle className="text-base">{location.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {location.address || "Tanpa alamat"}
                    </p>
                </div>
                {renderActionDropdown && renderActionDropdown(location)}
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={isInactive ? "destructive" : "success"}>
                        {isInactive ? "Nonaktif" : "Aktif"}
                    </Badge>
                    <Badge variant="outline">
                        {location.type?.name || "Tanpa Tipe"}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
