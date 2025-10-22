import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import UnifiedBadge from "@/Components/UnifiedBadge";

export default function UserMobileCard({ user, renderActionDropdown }) {
    return (
        <Card key={user.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                    {user.name}
                </CardTitle>
                {renderActionDropdown && renderActionDropdown(user)}
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">
                        {user.role ? user.role.code : "-"}
                    </span>
                    <UnifiedBadge text={user.role?.name} />
                </div>
            </CardContent>
        </Card>
    );
}
