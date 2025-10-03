import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { UserCircle } from "lucide-react";
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
                {renderActionDropdown(location)}
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={isInactive ? "destructive" : "success"}>
                        {isInactive ? "Nonaktif" : "Aktif"}
                    </Badge>
                    <Badge variant="outline">
                        {location.type?.name || "Tanpa Tipe"}
                    </Badge>
                    {location.users && location.users.length > 0 && (
                        <div className="flex items-center text-xs text-muted-foreground">
                            <UserCircle className="w-3 h-3 mr-1.5" />
                            <span>
                                {location.users
                                    .map((user) => user.name)
                                    .join(", ")}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
