import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatGroupName } from '@/lib/utils';

export default function TypeMobileCard({ type, renderActionDropdown }) {
    return (
        <Card key={type.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                    {type.name}
                </CardTitle>
                {renderActionDropdown(type)}
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">
                    {formatGroupName(type.group)}
                </p>
                <div className="mt-2">
                    <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">
                        {type.code || 'NO CODE'}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
