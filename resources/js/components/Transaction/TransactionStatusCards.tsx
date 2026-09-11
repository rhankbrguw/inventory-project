import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';
import { AlertTriangle, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

type PendingApprovalCardProps = {
    description: string;
    canApprove: boolean;
    isProcessing: boolean;
    onReject: () => void;
    onApprove: () => void;
};

type ReadyToShipCardProps = {
    description: string;
    canShip: boolean;
    isProcessing: boolean;
    onShip: () => void;
    isPaymentSufficient?: boolean;
};

type InShippingCardProps = {
    description: string;
    canReceive: boolean;
    isProcessing: boolean;
    onReceive: () => void;
};

export function PendingApprovalCard({ description, canApprove, isProcessing, onReject, onApprove }: PendingApprovalCardProps) {
    const { t } = useTranslation();
    if (!canApprove) return null;

    return (
        <Card className="mb-6 border-warning/50 bg-warning/5">
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        <div>
                            <h3 className="font-semibold text-warning-foreground">
                                {t('ui.pending_approval')}
                            </h3>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="flex-1 sm:flex-none border-destructive text-destructive hover:bg-destructive/10"
                            onClick={onReject}
                            disabled={isProcessing}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            {t('ui.reject')}
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none bg-success hover:bg-success/90 text-primary-foreground"
                            onClick={onApprove}
                            disabled={isProcessing}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t('ui.approve')}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ReadyToShipCard({ description, canShip, isProcessing, onShip, isPaymentSufficient = true }: ReadyToShipCardProps) {
    const { t } = useTranslation();
    if (!canShip) return null;

    const isBlocked = !isPaymentSufficient;

    return (
        <Card className={cn('mb-6', isBlocked ? 'border-warning/50 bg-warning/5' : 'border-info/50 bg-info/5')}>
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {isBlocked ? <Clock className="h-5 w-5 text-warning" /> : <Truck className="h-5 w-5 text-info" />}
                        <div>
                            <h3 className={cn('font-semibold', isBlocked ? 'text-warning-foreground' : 'text-info-foreground')}>
                                {isBlocked ? t('ui.payment_pending') : t('ui.ready_to_ship')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {isBlocked ? t('ui.payment_required_before_shipping_hint') : description}
                            </p>
                        </div>
                    </div>
                    <Button
                        className={cn(isBlocked ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-info hover:bg-info/90 text-primary-foreground')}
                        onClick={onShip}
                        disabled={isProcessing || isBlocked}
                    >
                        <Truck className="h-4 w-4 mr-2" />
                        {t('ui.ship_goods')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function InShippingCard({ description, canReceive, isProcessing, onReceive }: InShippingCardProps) {
    const { t } = useTranslation();
    if (!canReceive) return null;

    return (
        <Card className="mb-6 border-highlight/50 bg-highlight/5">
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-highlight" />
                        <div>
                            <h3 className="font-semibold text-foreground">{t('ui.in_shipping')}</h3>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    <Button
                        className="bg-success hover:bg-success/90 text-primary-foreground"
                        onClick={onReceive}
                        disabled={isProcessing}
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('ui.receive_goods')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
