import { useState } from 'react';
import ContentPageLayout from '@/components/ContentPageLayout';
import TransactionInfoGrid from '@/components/Transaction/TransactionInfoGrid';
import TransactionItemsSection from '@/components/Transaction/TransactionItemsSection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { formatDate } from '@/lib/utils';
import { transferDetailColumns } from '@/constants/tableColumns';
import { router } from '@inertiajs/react';
import {
    CheckCircle,
    XCircle,
    Truck,
    PackageCheck,
    AlertTriangle,
} from 'lucide-react';
import UnifiedBadge from '@/components/UnifiedBadge';

export default function Show({
    auth,
    transfer,
    canApprove,
    canShip,
    canReceive,
}) {
    const { data } = transfer;

    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApprove = () => {
        setIsProcessing(true);
        router.post(
            route('transactions.transfers.approve', data.id),
            {},
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setIsApproveDialogOpen(false);
                },
            }
        );
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) return;
        setIsProcessing(true);
        router.post(
            route('transactions.transfers.reject', data.id),
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

    const handleShip = () => {
        setIsProcessing(true);
        router.post(
            route('transactions.transfers.ship', data.id),
            {},
            {
                onFinish: () => setIsProcessing(false),
            }
        );
    };

    const handleReceive = () => {
        setIsProcessing(true);
        router.post(
            route('transactions.transfers.receive', data.id),
            {},
            {
                onFinish: () => setIsProcessing(false),
            }
        );
    };

    const infoFields = [
        { label: 'Dari Lokasi', value: data.from_location?.name },
        { label: 'Ke Lokasi', value: data.to_location?.name },
        { label: 'Tanggal Transfer', value: formatDate(data.transfer_date) },
        {
            label: 'Status',
            value: <UnifiedBadge text={data.status} code={data.status} />,
        },
        { label: 'Dibuat Oleh', value: data.user?.name },
        {
            label: 'Diterima Oleh',
            value: data.received_by?.name,
            hidden: !data.received_by,
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
            span: 'full',
            hidden: !data.rejection_reason,
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
            title={`Transfer ${data.reference_code}`}
            backRoute="transactions.index"
        >
            {data.status === 'Pending Approval' && canApprove && (
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-warning" />
                                <div>
                                    <h3 className="font-semibold">
                                        Menunggu Persetujuan
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Ada Transfer baru yang membutuhkan
                                        konfirmasi Anda
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    className="flex-1 sm:flex-none"
                                    onClick={() => setIsRejectDialogOpen(true)}
                                    disabled={isProcessing}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Tolak
                                </Button>
                                <Button
                                    className="bg-success hover:bg-success/90 text-primary-foreground flex-1 sm:flex-none"
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
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5 text-info" />
                                <div>
                                    <h3 className="font-semibold">
                                        Siap Dikirim
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Transfer telah disetujui. Segera lakukan
                                        proses pengiriman.
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="bg-info hover:bg-info/90 text-primary-foreground"
                                onClick={handleShip}
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
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <PackageCheck className="h-5 w-5 text-purple" />
                                <div>
                                    <h3 className="font-semibold">
                                        Dalam Pengiriman
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Konfirmasi setelah barang diterima
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="bg-success hover:bg-success/90 text-primary-foreground"
                                onClick={handleReceive}
                                disabled={isProcessing}
                            >
                                <PackageCheck className="h-4 w-4 mr-2" />
                                Terima Barang
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <TransactionInfoGrid
                title="Informasi Transfer"
                subtitle={data.reference_code}
                fields={infoFields}
            />

            <TransactionItemsSection
                type="transfer"
                items={data.items}
                columns={transferDetailColumns}
            />

            <AlertDialog
                open={isApproveDialogOpen}
                onOpenChange={setIsApproveDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Setujui Transfer?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Status akan berubah menjadi On Process.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="bg-success hover:bg-success/90 text-primary-foreground"
                        >
                            {isProcessing ? 'Memproses...' : 'Setujui Transfer'}
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
                            Tolak Transfer
                        </DialogTitle>
                        <DialogDescription>
                            Berikan alasan penolakan
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
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
                            onClick={handleReject}
                            disabled={isProcessing || !rejectionReason.trim()}
                        >
                            {isProcessing ? 'Memproses...' : 'Tolak Transfer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ContentPageLayout>
    );
}
