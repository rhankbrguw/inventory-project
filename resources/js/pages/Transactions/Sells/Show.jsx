import ContentPageLayout from "@/components/ContentPageLayout";
import PrintButton from "@/components/PrintButton";
import InstallmentSchedule from "@/components/InstallmentSchedule";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TableFooter, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, formatNumber, cn } from "@/lib/utils";
import DataTable from "@/components/DataTable";
import { sellDetailColumns } from "@/constants/tableColumns";
import React from "react";

export default function Show({ auth, sell }) {
    const { data } = sell;

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

        const totalMargin = totalSell - totalCost;
        return { totalSell, totalCost, totalMargin };
    }, [data.items]);

    const renderMobileItem = (item) => {
        const quantity = Math.abs(item.quantity || 0);
        const sellPrice = item.cost_per_unit || 0;
        const avgCost = item.average_cost_per_unit || 0;
        const total = quantity * sellPrice;
        const margin = (sellPrice - avgCost) * quantity;

        return (
            <Card
                key={item.id}
                className={cn(
                    "p-3",
                    item.product?.deleted_at && "opacity-60 bg-muted/50",
                )}
            >
                <div className="space-y-2">
                    <div>
                        <p className="font-medium text-sm">
                            {item.product?.name || "Produk Telah Dihapus"}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                            {item.product?.sku || "-"}
                        </p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span>
                            {formatNumber(quantity)} {item.product?.unit} ×{" "}
                            {formatCurrency(sellPrice)}
                        </span>
                        <span className="font-semibold">
                            {formatCurrency(total)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t pt-2 mt-2">
                        <span className="text-muted-foreground">
                            Harga Modal
                        </span>
                        <span className="text-muted-foreground">
                            {formatCurrency(avgCost)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Margin</span>
                        <span
                            className={cn(
                                "font-semibold",
                                margin > 0
                                    ? "text-[hsl(var(--success))]"
                                    : "text-destructive",
                            )}
                        >
                            {formatCurrency(margin)}
                        </span>
                    </div>
                </div>
            </Card>
        );
    };

    const renderDesktopFooter = () => (
        <TableFooter>
            <TableRow>
                <TableCell
                    colSpan={6}
                    className="text-right font-bold text-base"
                >
                    Total Penjualan
                </TableCell>
                <TableCell className="text-right font-bold text-base">
                    {formatCurrency(totals.totalSell)}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell
                    colSpan={6}
                    className="text-right font-medium text-muted-foreground"
                >
                    Total Modal (HPP)
                </TableCell>
                <TableCell className="text-right font-medium text-muted-foreground">
                    {formatCurrency(totals.totalCost)}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell
                    colSpan={6}
                    className="text-right font-bold text-base"
                >
                    Total Margin
                </TableCell>
                <TableCell
                    className={cn(
                        "text-right font-bold text-base",
                        totals.totalMargin > 0
                            ? "text-[hsl(var(--success))]"
                            : "text-destructive",
                    )}
                >
                    {formatCurrency(totals.totalMargin)}
                </TableCell>
            </TableRow>
        </TableFooter>
    );

    return (
        <ContentPageLayout
            auth={auth}
            title="Detail Transaksi"
            backRoute="transactions.index"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Umum</CardTitle>
                    <CardDescription>{data.reference_code}</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">
                            Lokasi Penjualan
                        </p>
                        <p className="font-semibold">{data.location?.name}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Pelanggan</p>
                        <p className="font-semibold">
                            {data.customer?.name || "Pelanggan Umum"}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">
                            Tanggal Transaksi
                        </p>
                        <p className="font-semibold">
                            {formatDate(data.transaction_date)}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="outline" className="capitalize">
                            {data.status}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Pembayaran</p>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">
                                {data.installment_terms === 1
                                    ? "Lunas"
                                    : `Cicilan ${data.installment_terms}x`}
                            </span>
                            {data.has_installments && (
                                <Badge
                                    variant={
                                        data.payment_status === "paid"
                                            ? "default"
                                            : data.payment_status === "partial"
                                                ? "secondary"
                                                : "outline"
                                    }
                                    className={cn(
                                        data.payment_status === "paid" &&
                                        "bg-success/10 text-success border-success/20",
                                    )}
                                >
                                    {data.payment_status === "paid"
                                        ? "Lunas"
                                        : data.payment_status === "partial"
                                            ? "Sebagian"
                                            : "Belum Bayar"}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-muted-foreground">PIC</p>
                        <p className="font-semibold">{data.user?.name}</p>
                    </div>
                    {data.notes && (
                        <div className="sm:col-span-3">
                            <p className="text-muted-foreground">Catatan</p>
                            <p className="font-semibold">{data.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {data.has_installments && (
                <InstallmentSchedule
                    installments={data.installments}
                    paymentStatus={data.payment_status}
                />
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle>Rincian Item</CardTitle>
                    <PrintButton>
                        <span className="hidden sm:inline">Cetak</span>
                    </PrintButton>
                </CardHeader>
                <CardContent>
                    {/* Mobile View */}
                    <div className="md:hidden space-y-3">
                        {data.items.map(renderMobileItem)}

                        <Separator className="my-4" />

                        <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-base">
                                    Total Penjualan
                                </span>
                                <span className="font-bold text-base">
                                    {formatCurrency(totals.totalSell)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">
                                    Total Modal (HPP)
                                </span>
                                <span className="text-muted-foreground">
                                    {formatCurrency(totals.totalCost)}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-base">
                                    Total Margin
                                </span>
                                <span
                                    className={cn(
                                        "font-bold text-base",
                                        totals.totalMargin > 0
                                            ? "text-[hsl(var(--success))]"
                                            : "text-destructive",
                                    )}
                                >
                                    {formatCurrency(totals.totalMargin)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <DataTable
                            columns={sellDetailColumns}
                            data={data.items}
                            footer={renderDesktopFooter()}
                        />
                    </div>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}
