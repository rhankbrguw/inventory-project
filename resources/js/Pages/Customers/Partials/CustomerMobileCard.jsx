import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export default function CustomerMobileCard({ customer, renderActionDropdown }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                    {customer.name}
                </CardTitle>
                {renderActionDropdown && renderActionDropdown(customer)}
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>{customer.email}</p>
                    <p>{customer.phone || "No phone number"}</p>
                </div>
            </CardContent>
        </Card>
    );
}
