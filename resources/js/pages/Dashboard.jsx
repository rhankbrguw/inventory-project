import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DollarSign,
    Package,
    ArrowDownLeft,
    AlertCircle,
    ArrowUpRight,
    TrendingUp,
    TrendingDown,
    Eye,
} from "lucide-react";
import { formatCurrency, formatNumber, cn, formatDate } from "@/lib/utils";
import UnifiedBadge from "@/components/UnifiedBadge";

const StatCard = ({ title, value, icon, description, trend }) => {
    return (
        <Card className="hover:shadow-md transition-all duration-300 hover:border-primary/50 group">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground leading-tight">
                    {title}
                </CardTitle>
                <div className="p-2 sm:p-2.5 rounded-lg bg-secondary group-hover:bg-primary/10 flex-shrink-0 transition-colors duration-300">
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight break-words text-foreground">
                    {value}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
                {trend && (
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap pt-2 border-t border-border">
                        {trend.value > 0 ? (
                            <>
                                <TrendingUp className="h-3.5 w-3.5 text-success" />
                                <span className="text-xs font-semibold text-success">
                                    +{trend.value}%
                                </span>
                            </>
                        ) : (
                            <>
                                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                                <span className="text-xs font-semibold text-destructive">
                                    {trend.value}%
                                </span>
                            </>
                        )}
                        <span className="text-xs text-muted-foreground">
                            vs kemarin
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const RecentActivityCard = ({ movements }) => {
    return (
        <Card className="col-span-1 md:col-span-2 hover:shadow-md transition-all duration-300 hover:border-primary/50">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-semibold text-foreground">
                            Aktivitas Terbaru
                        </CardTitle>
                        <CardDescription className="mt-1.5 text-sm">
                            5 pergerakan stok terakhir
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="self-start sm:self-auto bg-transparent"
                        asChild
                    >
                        <Link href={route("stock-movements.index")}>
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">
                                Lihat Semua
                            </span>
                            <span className="sm:hidden">All</span>
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {movements.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-sm">Belum ada pergerakan stok</p>
                        </div>
                    ) : (
                        movements.map((move, index) => (
                            <div
                                key={move.id}
                                className={cn(
                                    "flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-secondary/40",
                                    index !== movements.length - 1 &&
                                    "border-b border-border",
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-2.5 rounded-lg flex items-center justify-center flex-shrink-0 font-medium",
                                        move.quantity > 0
                                            ? "bg-success/10 text-success"
                                            : "bg-destructive/10 text-destructive",
                                    )}
                                >
                                    {move.quantity > 0 ? (
                                        <ArrowUpRight className="h-4 w-4" />
                                    ) : (
                                        <ArrowDownLeft className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {move.product?.name || "Produk Dihapus"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                                            {move.location?.name ||
                                                "Lokasi Dihapus"}
                                        </span>
                                        {move.created_at && (
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(move.created_at)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0">
                                    <span
                                        className={cn(
                                            "text-sm font-bold",
                                            move.quantity > 0
                                                ? "text-success"
                                                : "text-destructive",
                                        )}
                                    >
                                        {move.quantity > 0 ? "+" : ""}
                                        {formatNumber(move.quantity)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {move.product?.unit || "unit"}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const WelcomeCard = ({ user }) => {
    const roleName =
        user.roles && user.roles.length > 0 ? user.roles[0] : "Pengguna";

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 hover:shadow-md transition-all duration-300 hover:border-primary/50 border-primary/30">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                    Selamat Datang! 👋
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        Login sebagai
                    </p>
                    <p className="text-base font-semibold mt-2 break-words text-foreground">
                        {user.name}
                    </p>
                </div>
                <div className="inline-block">
                    <UnifiedBadge text={roleName} />
                </div>
                <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Gunakan menu navigasi untuk mengelola inventaris dan
                        melacak pergerakan stok.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default function Dashboard({ auth, stats, recentMovements }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Dashboard
                </h1>
            </div>

            <div className="space-y-6">
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Penjualan Hari Ini"
                        value={formatCurrency(stats.total_sales_today)}
                        icon={<DollarSign className="h-4 w-4 text-success" />}
                        trend={{ value: 12.5 }}
                    />
                    <StatCard
                        title="Pembelian Hari Ini"
                        value={formatCurrency(stats.total_purchases_today)}
                        icon={
                            <ArrowDownLeft className="h-4 w-4 text-destructive" />
                        }
                        trend={{ value: -5.2 }}
                    />
                    <StatCard
                        title="Total Nilai Inventaris"
                        value={formatCurrency(stats.total_inventory_value)}
                        icon={<Package className="h-4 w-4 text-primary" />}
                    />
                    <StatCard
                        title="Item Stok Menipis"
                        value={formatNumber(stats.low_stock_items_count)}
                        description="Stok ≤ 5 unit"
                        icon={
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        }
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <RecentActivityCard movements={recentMovements.data} />
                    <WelcomeCard user={auth.user} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
