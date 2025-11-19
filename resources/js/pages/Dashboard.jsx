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
    Calendar,
    User as UserIcon,
} from "lucide-react";
import { formatCurrency, formatNumber, cn, formatDate } from "@/lib/utils";

const WelcomeBanner = ({ user }) => {
    const roleName = user.role?.name || "Pengguna";

    const currentDate = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-lg relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                        Selamat Datang, {user.name}! 👋
                    </h2>
                    <p className="text-primary-foreground/80 text-sm md:text-base max-w-xl">
                        Lihat laporan hari ini.
                    </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-primary-foreground/10">
                        <UserIcon className="h-4 w-4" />
                        <span className="text-sm font-medium uppercase tracking-wider">
                            {roleName}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{currentDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, description, trend }) => {
    return (
        <Card className="hover:shadow-md transition-all duration-300 hover:border-primary/50 group h-full">
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
                {trend && trend.value !== undefined && (
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap pt-2 border-t border-border">
                        {trend.value > 0 ? (
                            <>
                                <TrendingUp className="h-3.5 w-3.5 text-success" />
                                <span className="text-xs font-semibold text-success">
                                    +{trend.value}%
                                </span>
                            </>
                        ) : trend.value < 0 ? (
                            <>
                                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                                <span className="text-xs font-semibold text-destructive">
                                    {trend.value}%
                                </span>
                            </>
                        ) : (
                            <span className="text-xs font-semibold text-muted-foreground">
                                0%
                            </span>
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
        <Card className="col-span-1 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/50 h-full">
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

export default function Dashboard({ auth, stats, recentMovements }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <WelcomeBanner user={auth.user} />

            <div className="space-y-6">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Penjualan Hari Ini"
                        value={formatCurrency(stats.total_sales_today)}
                        icon={<DollarSign className="h-4 w-4 text-success" />}
                        trend={{ value: stats.sales_trend }}
                    />
                    <StatCard
                        title="Pembelian Hari Ini"
                        value={formatCurrency(stats.total_purchases_today)}
                        icon={
                            <ArrowDownLeft className="h-4 w-4 text-destructive" />
                        }
                        trend={{ value: stats.purchases_trend }}
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

                <div className="grid gap-4">
                    <RecentActivityCard movements={recentMovements.data} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
