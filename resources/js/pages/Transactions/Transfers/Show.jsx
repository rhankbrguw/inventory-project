import ContentPageLayout from "@/components/ContentPageLayout";
import PrintButton from "@/components/PrintButton";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { formatDate, formatNumber, cn } from "@/lib/utils";
import DataTable from "@/components/DataTable";
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

    const renderMobileItem = (item) => {
        const quantity = Math.abs(item.quantity || 0);

        return (
            <Card
                key={item.id}
                className={cn(
                    "p-3",
                    item.product?.deleted_at && "opacity-60 bg-muted/50",
                )}
            >
                <div className="space-y-2 text-sm">
                    <div>
                        <p className="font-medium">
                            {item.product?.name || "Produk Telah Dihapus"}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                            {item.product?.sku || "-"}
                        </p>
                    </div>

                    <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-muted-foreground">Qty</span>
                        <span className="font-semibold">
                            {formatNumber(quantity)} {item.product?.unit}
                        </span>
                    </div>
                </div>
            </Card>
        );
    };

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
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setIsRejectDialogOpen(true)}
                                    variant="outline"
                                    size="sm"
                                    disabled={isProcessing}
                                    className="gap-2"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Tolak
                                </Button>
                                <Button
                                    onClick={() => setIsAcceptDialogOpen(true)}
                                    size="sm"
                                    disabled={isProcessing}
                                    className="gap-2 bg-success hover:bg-success/90"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Terima
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Umum</CardTitle>
                    <CardDescription>{data.reference_code}</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Dari Lokasi</p>
                        <p className="font-semibold">
                            {data.from_location?.name}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Ke Lokasi</p>
                        <p className="font-semibold">
                            {data.to_location?.name}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">
                            Tanggal Transfer
                        </p>
                        <p className="font-semibold">
                            {formatDate(data.transfer_date)}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge
                            variant="outline"
                            className={cn(
                                "capitalize",
                                data.status === "completed" &&
                                "border-success/20 bg-success/10 text-success",
                                data.status === "rejected" &&
                                "border-destructive/20 bg-destructive/10 text-destructive",
                            )}
                        >
                            {data.status}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Dibuat Oleh</p>
                        <p className="font-semibold">{data.user?.name}</p>
                    </div>

                    {data.received_by && (
                        <div>
                            <p className="text-muted-foreground">
                                Diterima Oleh
                            </p>
                            <p className="font-semibold">
                                {data.received_by.name}
                            </p>
                            {data.received_at && (
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(data.received_at)}
                                </p>
                            )}
                        </div>
                    )}

                    {data.rejected_by && (
                        <>
                            <div>
                                <p className="text-muted-foreground">
                                    Ditolak Oleh
                                </p>
                                <p className="font-semibold">
                                    {data.rejected_by.name}
                                </p>
                                {data.rejected_at && (
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(data.rejected_at)}
                                    </p>
                                )}
                            </div>
                            <div className="sm:col-span-3">
                                <p className="text-muted-foreground">
                                    Alasan Penolakan
                                </p>
                                <p className="font-semibold text-destructive">
                                    {data.rejection_reason}
                                </p>
                            </div>
                        </>
                    )}

                    {data.notes && (
                        <div className="sm:col-span-3">
                            <p className="text-muted-foreground">Catatan</p>
                            <p className="font-semibold">{data.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle>Rincian Item</CardTitle>
                    <PrintButton>
                        <span className="hidden sm:inline">Cetak</span>
                    </PrintButton>
                </CardHeader>

                <CardContent>
                    <div className="md:hidden space-y-3">
                        {data.items.map(renderMobileItem)}
                        <Separator className="my-4" />
                    </div>

                    <div className="hidden md:block">
                        <DataTable
                            columns={transferDetailColumns}
                            data={data.items}
                        />
                    </div>
                </CardContent>
            </Card>

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
