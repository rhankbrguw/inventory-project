import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Label,
    ResponsiveContainer,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    DollarSign,
    Package,
    TrendingUp,
    AlertTriangle,
    TrendingDown,
    PackageX,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import StockMovementMobileCard from "./StockMovements/Partials/StockMovementMobileCard";

const salesChartConfig = {
    total: {
        label: "Penjualan",
        color: "hsl(var(--primary))",
    },
};

const paymentChartConfig = {
    count: {
        label: "Transaksi",
    },
    Tunai: {
        label: "Tunai",
        color: "hsl(var(--chart-1))",
    },
    QRIS: {
        label: "QRIS",
        color: "hsl(var(--chart-2))",
    },
    "Transfer Bank": {
        label: "Transfer",
        color: "hsl(var(--chart-3))",
    },
    Other: {
        label: "Lainnya",
        color: "hsl(var(--chart-4))",
    },
    "No Data": {
        label: "Tidak Ada Data",
        color: "hsl(var(--muted))",
    },
};

const topProductConfig = {
    total_qty: {
        label: "Terjual",
        color: "hsl(var(--chart-2))",
    },
};

export default function Dashboard({
    auth,
    stats,
    charts,
    recentMovements,
    locations,
    filters,
}) {
    const handleFilterChange = (key, value) => {
        router.get(
            route("dashboard"),
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true }
        );
    };

    const pieData = charts.channels.map((item, index) => ({
        ...item,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    }));

    const hasTopProducts = charts.top_items && charts.top_items.length > 0;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Ringkasan performa bisnis Anda.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select
                        value={filters.date_range || "this_month"}
                        onValueChange={(val) =>
                            handleFilterChange("date_range", val)
                        }
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Rentang Waktu" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Hari Ini</SelectItem>
                            <SelectItem value="last_7_days">
                                7 Hari Terakhir
                            </SelectItem>
                            <SelectItem value="this_month">Bulan Ini</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.location_id || "all"}
                        onValueChange={(val) =>
                            handleFilterChange("location_id", val)
                        }
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Semua Lokasi" />
                        </SelectTrigger>
                        <SelectContent>
                            {auth.user.level === 1 && (
                                <SelectItem value="all">Semua Lokasi</SelectItem>
                            )}
                            {locations.map((loc) => (
                                <SelectItem
                                    key={loc.id}
                                    value={loc.id.toString()}
                                >
                                    {loc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pendapatan Kotor
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.revenue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total penjualan periode ini
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Profit Bersih (Est)
                        </CardTitle>
                        {stats.net_profit >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${stats.net_profit >= 0
                                ? "text-success"
                                : "text-destructive"
                                }`}
                        >
                            {formatCurrency(stats.net_profit)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pendapatan - HPP (Modal)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Nilai Aset Stok
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.inventory_value)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total nilai aset saat ini
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Stok Menipis
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {formatNumber(stats.low_stock_count)} Item
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Butuh restock segera
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7 mb-8">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Tren Penjualan</CardTitle>
                        <CardDescription>
                            Performa harian periode ini
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={salesChartConfig}>
                            <BarChart accessibilityLayer data={charts.sales}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 5)}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) =>
                                        `Rp${value / 1000}k`
                                    }
                                    width={80}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            hideLabel
                                            formatter={(value) =>
                                                formatCurrency(value)
                                            }
                                        />
                                    }
                                />
                                <Bar
                                    dataKey="total"
                                    fill="var(--color-total)"
                                    radius={4}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3 flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle>Metode Pembayaran</CardTitle>
                        <CardDescription>Distribusi Channel</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer
                            config={paymentChartConfig}
                            className="mx-auto aspect-square max-h-[250px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={pieData}
                                    dataKey="count"
                                    nameKey="name"
                                    innerRadius={60}
                                    strokeWidth={5}
                                >
                                    <Label
                                        content={({ viewBox }) => {
                                            if (
                                                viewBox &&
                                                "cx" in viewBox &&
                                                "cy" in viewBox
                                            ) {
                                                return (
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            className="fill-foreground text-3xl font-bold"
                                                        >
                                                            {pieData.reduce(
                                                                (acc, curr) =>
                                                                    acc +
                                                                    curr.count,
                                                                0
                                                            )}
                                                        </tspan>
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={
                                                                (viewBox.cy ||
                                                                    0) + 24
                                                            }
                                                            className="fill-muted-foreground text-xs"
                                                        >
                                                            Transaksi
                                                        </tspan>
                                                    </text>
                                                );
                                            }
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col gap-2 text-sm">
                        <div className="leading-none text-muted-foreground">
                            Menampilkan total transaksi berdasarkan tipe
                            pembayaran
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Top 5 Produk Terlaris</CardTitle>
                        <CardDescription>
                            Berdasarkan kuantitas terjual
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {hasTopProducts ? (
                            <ChartContainer
                                config={topProductConfig}
                                className="h-[300px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={charts.top_items}
                                        layout="vertical"
                                        margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
                                    >
                                        <CartesianGrid
                                            horizontal={false}
                                            strokeDasharray="3 3"
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                            width={120}
                                            className="text-xs"
                                        />
                                        <XAxis
                                            type="number"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    hideLabel
                                                    formatter={(value) =>
                                                        `${formatNumber(value)} unit`
                                                    }
                                                />
                                            }
                                        />
                                        <Bar
                                            dataKey="total_qty"
                                            fill="var(--color-total_qty)"
                                            radius={[0, 4, 4, 0]}
                                            barSize={32}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                                <PackageX className="h-12 w-12 mb-4 opacity-50" />
                                <p className="text-sm font-medium">
                                    Belum ada data penjualan
                                </p>
                                <p className="text-xs mt-1">
                                    Data akan muncul setelah ada transaksi penjualan
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Aktivitas Stok Terbaru</CardTitle>
                        <CardDescription>Pergerakan Barang</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentMovements.data.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Belum ada aktivitas.
                                </div>
                            ) : (
                                recentMovements.data.map((movement) => (
                                    <StockMovementMobileCard
                                        key={movement.id}
                                        movement={movement}
                                    />
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
