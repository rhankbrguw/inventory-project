import React from 'react';
import { router } from '@inertiajs/react';
import { Truck, CheckCircle } from 'lucide-react';
import ContentPageLayout from '@/components/ContentPageLayout';
import PrintButton from '@/components/PrintButton';
import InstallmentSchedule from '@/components/InstallmentSchedule';
import TransactionInfoGrid from '@/components/Transaction/TransactionInfoGrid';
import TransactionPaymentBadge from '@/components/Transaction/TransactionPaymentBadge';
import TransactionItemsSection from '@/components/Transaction/TransactionItemsSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { sellDetailColumns } from '@/constants/tableColumns';
import UnifiedBadge from '@/components/UnifiedBadge';
import { formatDate } from '@/lib/utils';

export default function Show({ auth, sell, canShip, canReceive }) {
    const { data } = sell;

    const [isShipDialogOpen, setIsShipDialogOpen] = React.useState(false);
    const [isReceiveDialogOpen, setIsReceiveDialogOpen] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleShipConfirm = () => {
        setIsProcessing(true);
        router.post(
            route('transactions.sells.ship', data.id),
            {},
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setIsShipDialogOpen(false);
                },
            }
        );
    };

    const handleReceiveConfirm = () => {
        setIsProcessing(true);
        router.post(
            route('transactions.sells.receive', data.id),
            {},
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setIsReceiveDialogOpen(false);
                },
            }
        );
    };

    const totals = React.useMemo(() => {
        let totalSell = 0;
        let totalCost = 0;

        data.items.forEach((item) => {
            const quantity = Math.abs(item.quantity || 0);
            const sellPrice = item.cost_per_unit || 0;
            const avgCost = item.average_cost_per_unit || 0;

            totalSell += quantity * sellPrice;
            totalCost += quantity * avgCost;
        });

        return {
            totalSell,
            totalCost,
            totalMargin: totalSell - totalCost,
        };
    }, [data.items]);

    const infoFields = [
        {
            label: 'Lokasi Penjualan',
            value: data.location?.name,
        },
        {
            label: 'Pelanggan',
            value: data.customer?.name || 'Pelanggan Umum',
        },
        {
            label: 'Tanggal Transaksi',
            value: formatDate(data.transaction_date),
        },
        {
            label: 'Channel Penjualan',
            value: data.sales_channel ? (
                <div className="flex items-center gap-2">
                    <span className="font-semibold">
                        {data.sales_channel.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                        {data.sales_channel.code}
                    </Badge>
                </div>
            ) : null,
            hidden: !data.sales_channel,
        },
        {
            label: 'Status',
            value: <UnifiedBadge text={data.status} code={data.status} />,
        },
        {
            label: 'Pembayaran',
            value: null,
            badge: (
                <TransactionPaymentBadge
                    installmentTerms={data.installment_terms}
                    paymentStatus={data.payment_status}
                    hasInstallments={data.has_installments}
                />
            ),
        },
        {
            label: 'PIC',
            value: data.user?.name,
        },
        {
            label: 'Catatan',
            value: data.notes,
            span: 'full',
            hidden: !data.notes,
        },
    ];

    return (
        <ContentPageLayout
            auth={auth}
            title="Detail Transaksi"
            backRoute="transactions.index"
            action={
                <div className="flex gap-2 print-hidden">
                    <PrintButton>
                        <span className="hidden sm:inline">Cetak</span>
                    </PrintButton>

                    {canShip && (
                        <Button
                            onClick={() => setIsShipDialogOpen(true)}
                            className="btn-transfer flex items-center gap-2"
                        >
                            <Truck className="w-4 h-4" />
                            Kirim Barang
                        </Button>
                    )}

                    {canReceive && (
                        <Button
                            onClick={() => setIsReceiveDialogOpen(true)}
                            className="btn-sell flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Terima Barang
                        </Button>
                    )}
                </div>
            }
        >
            <TransactionInfoGrid
                title="Informasi Umum"
                subtitle={data.reference_code}
                fields={infoFields}
            />

            {data.has_installments && (
                <InstallmentSchedule
                    installments={data.installments}
                    paymentStatus={data.payment_status}
                />
            )}

            <TransactionItemsSection
                type="sell"
                items={data.items}
                columns={sellDetailColumns}
                totals={totals}
            />

            <AlertDialog
                open={isShipDialogOpen}
                onOpenChange={setIsShipDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Konfirmasi Kirim Barang
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Status transaksi akan berubah menjadi "Shipping".
                            Apakah Anda yakin ingin melanjutkan?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleShipConfirm}
                            disabled={isProcessing}
                            className="btn-transfer"
                        >
                            {isProcessing ? 'Memproses...' : 'Kirim Barang'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={isReceiveDialogOpen}
                onOpenChange={setIsReceiveDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Konfirmasi Terima Barang
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Stok akan otomatis masuk ke inventory cabang Anda.
                            Tindakan ini tidak dapat dibatalkan. Apakah Anda
                            yakin?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReceiveConfirm}
                            disabled={isProcessing}
                            className="btn-sell"
                        >
                            {isProcessing ? 'Memproses...' : 'Terima Barang'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ContentPageLayout>
    );
}
