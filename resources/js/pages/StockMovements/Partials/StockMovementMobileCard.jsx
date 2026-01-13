import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatNumber, formatTime } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export default function StockMovementMobileCard({ movement }) {
    const isPositive = parseFloat(movement.quantity) > 0;

    const renderKeterangan = () => {
        const od = movement.origin_destination;
        const ref = movement.reference;

        return (
            <div className="flex flex-col gap-1 mt-1">
                {od?.name && (
                    <div>
                        <span className="text-muted-foreground">
                            {od.label}:{' '}
                        </span>
                        <span className="font-medium text-foreground">
                            {od.name}
                        </span>
                    </div>
                )}

                {ref?.code && (
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Ref:</span>
                        {ref.url && ref.url !== '#' ? (
                            <Link
                                href={ref.url}
                                className="text-foreground hover:underline font-mono"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {ref.code}
                            </Link>
                        ) : (
                            <span className="font-mono text-foreground">
                                {ref.code}
                            </span>
                        )}
                    </div>
                )}

                {movement.type === 'adjustment' &&
                    !od?.name &&
                    movement.notes && (
                        <div>
                            <span className="text-muted-foreground">
                                Keterangan:{' '}
                            </span>
                            <span className="text-foreground">
                                {movement.notes}
                            </span>
                        </div>
                    )}
            </div>
        );
    };

    return (
        <Card className="hover:bg-accent/5 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium leading-none">
                        {movement.product?.name || 'Produk Dihapus'}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">
                        {movement.product?.sku || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Lokasi: {movement.location?.name || '-'}
                    </p>
                </div>
                <div
                    className={cn(
                        'text-lg font-bold whitespace-nowrap',
                        isPositive ? 'text-success' : 'text-destructive'
                    )}
                >
                    {isPositive ? '+' : ''}
                    {formatNumber(movement.quantity)}
                </div>
            </CardHeader>

            <CardContent className="text-sm pt-0 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 border-t border-border pt-2">
                    <Badge variant="outline" className="capitalize">
                        {movement.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        {formatDate(movement.created_at)} •{' '}
                        {formatTime(movement.created_at)}
                    </span>
                </div>

                <div className="text-xs bg-muted/40 p-2 rounded-md border border-border/50">
                    {renderKeterangan()}
                </div>
            </CardContent>
        </Card>
    );
}
