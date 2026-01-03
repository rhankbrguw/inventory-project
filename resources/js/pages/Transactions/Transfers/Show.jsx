import ContentPageLayout from "@/components/ContentPageLayout";
import TransactionInfoGrid from "@/components/Transaction/TransactionInfoGrid";
import TransactionItemsSection from "@/components/Transaction/TransactionItemsSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, cn } from "@/lib/utils";
import { transferDetailColumns } from "@/constants/tableColumns";
import { router } from "@inertiajs/react";
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function Show({ auth, transfer, can_accept }) {
    const { data } = transfer;

    const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
    const [isAcceptDialogOpen, setIsAcceptDialogOpen] = React.useState(false);
    const [rejectionReason, setRejectionReason] = React.useState("");
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleAcceptConfirm = () => {
        setIsProcessing(true);
        router.post(
            route("transactions.transfers.accept", data.id),
            {},
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setIsAcceptDialogOpen(false);
                },
            },
        );
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            return;
        }
        setIsProcessing(true);
        router.post(
            route("transactions.transfers.reject", data.id),
            { rejection_reason: rejectionReason },
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setIsRejectDialogOpen(false);
                    setRejectionReason("");
                },
            },
        );
    };

    const infoFields = [
        {
            label: "Dari Lokasi",
            value: data.from_location?.name,
        },
        {
            label: "Ke Lokasi",
            value: data.to_location?.name,
        },
        {
            label: "Tanggal Transfer",
            value: formatDate(data.transfer_date),
        },
        {
            label: "Status",
            badge: data.status,
            badgeVariant: "default",
            badgeClassName: cn(
                "capitalize",
                `status-${data.status.toLowerCase()}`,
            ),
        },
        {
            label: "Dibuat Oleh",
            value: data.user?.name,
        },
        {
            label: "Diterima Oleh",
            value: data.received_by ? (
                <>
                    <span className="font-semibold">
                        {data.received_by.name}
                    </span>
                    {data.received_at && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(data.received_at)}
                        </p>
                    )}
                </>
            ) : null,
            hidden: !data.received_by,
        },
        {
            label: "Ditolak Oleh",
            value: data.rejected_by ? (
                <>
                    <span className="font-semibold">
                        {data.rejected_by.name}
                    </span>
                    {data.rejected_at && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(data.rejected_at)}
                        </p>
                    )}
                </>
            ) : null,
            hidden: !data.rejected_by,
        },
        {
            label: "Alasan Penolakan",
            value: (
                <span className="font-semibold text-destructive">
                    {data.rejection_reason}
                </span>
            ),
            span: "full",
            hidden: !data.rejection_reason,
        },
        {
            label: "Catatan",
            value: data.notes,
            span: "full",
            hidden: !data.notes,
        },
    ];

    return (
        <ContentPageLayout
            auth={auth}
            title="Detail Transfer Stok"
            backRoute="transactions.index"
        >
            {data.status === "pending" && can_accept && (
                <Card className="border-info/20 bg-info/5">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold mb-1">
                                    Transfer Menunggu Konfirmasi
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Anda dapat menerima atau menolak transfer
                                    ini
                                </p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={() => setIsRejectDialogOpen(true)}
                                    variant="outline"
                                    size="sm"
                                    disabled={isProcessing}
                                    className="gap-2 flex-1 sm:flex-none"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Tolak
                                </Button>
                                <Button
                                    onClick={() => setIsAcceptDialogOpen(true)}
                                    size="sm"
                                    disabled={isProcessing}
                                    className="gap-2 bg-success hover:bg-success/90 flex-1 sm:flex-none"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Terima
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <TransactionInfoGrid
                title="Informasi Umum"
                subtitle={data.reference_code}
                fields={infoFields}
            />

            <TransactionItemsSection
                type="transfer"
                items={data.items}
                columns={transferDetailColumns}
            />

            <AlertDialog
                open={isAcceptDialogOpen}
                onOpenChange={setIsAcceptDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Terima Transfer?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Stok akan masuk ke lokasi Anda. Tindakan ini tidak
                            dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAcceptConfirm}
                            disabled={isProcessing}
                            className="bg-success hover:bg-success/90"
                        >
                            {isProcessing ? "Memproses..." : "Terima Transfer"}
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
                        <DialogTitle>Tolak Transfer</DialogTitle>
                        <DialogDescription>
                            Berikan alasan penolakan transfer ini
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Contoh: Barang tidak sesuai pesanan"
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
                            {isProcessing ? "Memproses..." : "Tolak Transfer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ContentPageLayout>
    );
}
