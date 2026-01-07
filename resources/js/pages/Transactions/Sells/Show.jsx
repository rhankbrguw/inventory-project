import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Truck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ContentPageLayout from '@/components/ContentPageLayout';
import PrintButton from '@/components/PrintButton';
import InstallmentSchedule from '@/components/InstallmentSchedule';
import TransactionInfoGrid from '@/components/Transaction/TransactionInfoGrid';
import TransactionPaymentBadge from '@/components/Transaction/TransactionPaymentBadge';
import TransactionItemsSection from '@/components/Transaction/TransactionItemsSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import UnifiedBadge from '@/components/UnifiedBadge';
import { formatDate } from '@/lib/utils';
import { sellDetailColumns } from '@/constants/tableColumns';

export default function Show({ auth, sell, canShip, canReceive, canApprove }) {
    const { data } = sell;

    const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
    const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

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

    const handleApproveConfirm = () => {
        setIsProcessing(true);
        router.post(
            route('transactions.sells.approve', data.id),
            {},
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setIsApproveDialogOpen(false);
                },
            }
        );
    };

    const handleRejectConfirm = () => {
        if (!rejectionReason.trim()) return;
        setIsProcessing(true);
        router.post(
            route('transactions.sells.reject', data.id),
            { rejection_reason: rejectionReason },
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setIsRejectDialogOpen(false);
                    setRejectionReason('');
                },
            }
        );
    };

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
                <span className="flex items-center gap-2">
                    <span className="font-semibold">
                        {data.sales_channel.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                        {data.sales_channel.code}
                    </Badge>
                </span>
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
            label: 'Disetujui Oleh',
            value: data.approved_by?.name,
            hidden: !data.approved_by,
        },
        {
            label: 'Ditolak Oleh',
            value: data.rejected_by?.name,
            hidden: !data.rejected_by,
        },
        {
            label: 'Alasan Penolakan',
            value: (
                <span className="text-destructive font-medium">
                    {data.rejection_reason}
                </span>
            ),
            hidden: !data.rejection_reason,
            span: 'full',
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
                </div>
            }
        >
            {data.status === 'Pending Approval' && canApprove && (
                <Card className="mb-6 border-warning/50 bg-warning/5">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-warning" />
                                <div>
                                    <h3 className="font-semibold text-warning-foreground">
                                        Menunggu Persetujuan
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Pesanan stok masuk membutuhkan
                                        persetujuan Anda.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    className="flex-1 sm:flex-none border-destructive text-destructive hover:bg-destructive/10"
                                    onClick={() => setIsRejectDialogOpen(true)}
                                    disabled={isProcessing}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Tolak
                                </Button>
                                <Button
                                    className="flex-1 sm:flex-none bg-success hover:bg-success/90 text-primary-foreground"
                                    onClick={() => setIsApproveDialogOpen(true)}
                                    disabled={isProcessing}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Setujui
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {data.status === 'Approved' && canShip && (
                <Card className="mb-6 border-info/50 bg-info/5">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5 text-info" />
                                <div>
                                    <h3 className="font-semibold text-info-foreground">
                                        Siap Dikirim
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Pesanan telah disetujui. Segera proses
                                        pengiriman.
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="bg-info hover:bg-info/90 text-primary-foreground"
                                onClick={() => setIsShipDialogOpen(true)}
                                disabled={isProcessing}
                            >
                                <Truck className="h-4 w-4 mr-2" />
                                Kirim Barang
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {data.status === 'Shipping' && canReceive && (
                <Card className="mb-6 border-purple/50 bg-purple/5">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5 text-purple" />
                                <div>
                                    <h3 className="font-semibold text-purple-foreground">
                                        Dalam Pengiriman
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Konfirmasi jika barang sudah sampai di
                                        gudang Anda.
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="bg-success hover:bg-success/90 text-primary-foreground"
                                onClick={() => setIsReceiveDialogOpen(true)}
                                disabled={isProcessing}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Terima Barang
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                totals={data.totals}
                totalAmount={data.total_price}
            />

            <AlertDialog
                open={isApproveDialogOpen}
                onOpenChange={setIsApproveDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Setujui Pesanan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda menyetujui pesanan ini. Pihak pengirim akan
                            diberitahu untuk segera mengirim barang.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApproveConfirm}
                            disabled={isProcessing}
                            className="bg-success text-primary-foreground hover:bg-success/90"
                        >
                            {isProcessing ? 'Memproses...' : 'Ya, Setujui'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog
                open={isRejectDialogOpen}
                onOpenChange={setIsRejectDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">
                            Tolak Pesanan
                        </DialogTitle>
                        <DialogDescription>
                            Berikan alasan penolakan pesanan ini.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Contoh: Stok tidak mencukupi / Salah pesan"
                        rows={3}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRejectDialogOpen(false)}
                            disabled={isProcessing}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectConfirm}
                            disabled={isProcessing || !rejectionReason.trim()}
                        >
                            {isProcessing ? 'Memproses...' : 'Tolak Pesanan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                            Tindakan ini tidak dapat dibatalkan.
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
