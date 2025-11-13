import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    DollarSign,
    Package,
    ArrowDownLeft,
    AlertCircle,
    ArrowUpRight,
} from "lucide-react";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

const StatCard = ({ title, value, icon, description }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

const RecentActivityCard = ({ movements }) => {
    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
                <CardDescription>
                    5 pergerakan stok terakhir yang Anda miliki.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {movements.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Belum ada aktivitas.
                        </p>
                    )}
                    {movements.map((move) => (
                        <div
                            key={move.id}
                            className="flex items-center space-x-4"
                        >
                            <div
                                className={cn(
                                    "p-2 rounded-full flex items-center justify-center",
                                    move.quantity > 0
                                        ? "bg-success/10"
                                        : "bg-destructive/10",
                                )}
                            >
                                {move.quantity > 0 ? (
                                    <ArrowUpRight className="h-4 w-4 text-success" />
                                ) : (
                                    <ArrowDownLeft className="h-4 w-4 text-destructive" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {move.product?.name || "Produk Dihapus"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {move.location?.name || "Lokasi Dihapus"}
                                </p>
                            </div>
                            <div
                                className={cn(
                                    "text-sm font-semibold text-right",
                                    move.quantity > 0
                                        ? "text-success"
                                        : "text-destructive",
                                )}
                            >
                                {move.quantity > 0 ? "+" : ""}
                                {formatNumber(move.quantity)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default function Dashboard({ auth, stats, recentMovements }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-foreground leading-tight">
                    Halaman Utama
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Penjualan Hari Ini"
                        value={formatCurrency(stats.total_sales_today)}
                        icon={
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        }
                    />
                    <StatCard
                        title="Pembelian Hari Ini"
                        value={formatCurrency(stats.total_purchases_today)}
                        icon={
                            <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
                        }
                    />
                    <StatCard
                        title="Total Nilai Inventaris"
                        value={formatCurrency(stats.total_inventory_value)}
                        icon={
                            <Package className="h-4 w-4 text-muted-foreground" />
                        }
                    />
                    <StatCard
                        title="Item Stok Menipis"
                        value={formatNumber(stats.low_stock_items_count)}
                        description="Stok kurang dari atau sama dengan 10"
                        icon={
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        }
                    />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <RecentActivityCard movements={recentMovements.data} />
                    <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Welcome</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>You're logged in, {auth.user.name}!</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
