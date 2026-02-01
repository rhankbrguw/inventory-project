import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Truck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ContentPageLayout from '@/components/ContentPageLayout';
import InstallmentSchedule from '@/components/InstallmentSchedule';
import TransactionInfoGrid from '@/components/Transaction/TransactionInfoGrid';
import TransactionPaymentBadge from '@/components/Transaction/TransactionPaymentBadge';
import TransactionItemsSection from '@/components/Transaction/TransactionItemsSection';
import { purchaseDetailColumns } from '@/constants/tableColumns';
import UnifiedBadge from '@/components/UnifiedBadge';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

export default function Show({
    auth,
    purchase,
    canApprove,
    canShip,
    canReceive,
}) {
    const { data } = purchase;

    const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
    const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApproveConfirm = () => {
        setIsProcessing(true);
        router.post(
            route('transactions.purchases.approve', data.id),
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
            route('transactions.purchases.reject', data.id),
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

    const handleShipConfirm = () => {
        setIsProcessing(true);
        router.post(
            route('transactions.purchases.ship', data.id),
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
            route('transactions.purchases.receive', data.id),
            {},
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setIsReceiveDialogOpen(false);
                },
            }
        );
    };

    const getSourceDisplay = () => {
        if (data.is_internal && data.from_location) {
            return (
                <span className="font-semibold text-primary">
                    {data.from_location.name} (Internal)
                </span>
            );
        }
        if (data.supplier) {
            return data.supplier.name;
        }
        return 'Supplier Umum';
    };

    const infoFields = [
        {
            label: 'Lokasi Penerima',
            value: data.location.name,
        },
        {
            label: 'Sumber / Supplier',
            value: getSourceDisplay(),
        },
        {
            label: 'Tanggal Transaksi',
            value: formatDate(data.transaction_date),
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
            value: data.user.name,
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
                                        Ada permintaan Pembelian stok baru yang
                                        membutuhkan konfirmasi Anda.
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

            {data.status === 'On Process' && canShip && (
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
                                        Permintaan disetujui. Segera lakukan
                                        proses pengiriman.
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
                                        Konfirmasi jika barang sudah sampai.
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
                type="purchase"
                items={data.items}
                columns={purchaseDetailColumns}
                totalLabel="Total Pembelian"
                totalAmount={data.total_cost}
            />

            <AlertDialog
                open={isApproveDialogOpen}
                onOpenChange={setIsApproveDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Setujui Permintaan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda menyetujui permintaan stok ini. Status akan
                            berubah menjadi On Process.
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
                            Tolak Permintaan
                        </DialogTitle>
                        <DialogDescription>
                            Berikan alasan penolakan permintaan ini.
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
                            {isProcessing ? 'Memproses...' : 'Tolak Permintaan'}
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
                            Stok akan dikurangi dari gudang.
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
                            Stok akan otomatis masuk ke inventory. Tindakan ini
                            tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReceiveConfirm}
                            disabled={isProcessing}
                            className="btn-purchase"
                        >
                            {isProcessing ? 'Memproses...' : 'Terima Barang'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ContentPageLayout>
    );
}
