import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UnifiedBadge from '@/components/UnifiedBadge';

export default function CustomerMobileCard({ customer, renderActionDropdown }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1.5">
                    <CardTitle className="text-sm font-medium">
                        {customer.name}
                    </CardTitle>
                    <UnifiedBadge text={customer.type?.name} />
                </div>
                {renderActionDropdown && renderActionDropdown(customer)}
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>{customer.email}</p>
                    <p>{customer.phone || 'No phone number'}</p>
                </div>
            </CardContent>
        </Card>
    );
}
