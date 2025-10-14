import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export default function SupplierMobileCard({ supplier, renderActionDropdown }) {
    return (
        <Card key={supplier.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                    {supplier.name}
                </CardTitle>
                {renderActionDropdown(supplier)}
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">
                    {supplier.contact_person || "No contact"}
                </p>
                <p className="text-xs text-muted-foreground">
                    {supplier.email || "-"} | {supplier.phone || "-"}
                </p>
            </CardContent>
        </Card>
    );
}
