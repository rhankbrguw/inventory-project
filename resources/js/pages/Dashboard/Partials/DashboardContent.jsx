import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Label,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import {
    DollarSign,
    Package,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    BarChart2,
    PieChart as PieChartIcon,
    PackageX,
    Activity,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import DashboardMobileCard from "./DashboardMobileCard";

export default function DashboardContent({
    stats,
    charts,
    recentMovements,
    dateRangeLabel,
}) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                <StatCard
                    title="Pendapatan"
                    value={formatCurrency(stats.revenue)}
                    subtext={`Jual: ${dateRangeLabel}`}
                    icon={DollarSign}
                />
                <StatCard
                    title="Profit (Est)"
                    value={formatCurrency(stats.net_profit)}
                    subtext="Pendapatan - HPP"
                    icon={stats.net_profit >= 0 ? TrendingUp : TrendingDown}
                    trend={stats.net_profit >= 0 ? "up" : "down"}
                />
                <StatCard
                    title="Aset Stok"
                    value={formatCurrency(stats.inventory_value)}
                    subtext="Total nilai aset"
                    icon={Package}
                />
                <StatCard
                    title="Stok Tipis"
                    value={`${formatNumber(stats.low_stock_count)} Item`}
                    subtext="Restock segera"
                    icon={AlertTriangle}
                    trend={stats.low_stock_count > 0 ? "down" : "neutral"}
                />
            </div>

            <div className="grid gap-3 lg:grid-cols-12">
                <SalesChart
                    data={charts.sales}
                    dateRangeLabel={dateRangeLabel}
                />
                <ActivityList data={recentMovements.data} />
            </div>

            <div className="grid gap-3 lg:grid-cols-12">
                <TopProductsChart data={charts.top_items} />
                <PaymentMethodsChart data={charts.channels} />
            </div>
        </div>
    );
}

const chartConfigs = {
    sales: { total: { label: "Penjualan", color: "hsl(var(--primary))" } },
    payment: {
        count: { label: "Transaksi" },
        Tunai: { label: "Tunai", color: "hsl(var(--chart-1))" },
        QRIS: { label: "QRIS", color: "hsl(var(--chart-2))" },
        "Transfer Bank": { label: "Transfer", color: "hsl(var(--chart-3))" },
        Other: { label: "Lainnya", color: "hsl(var(--chart-4))" },
    },
    topProducts: {
        total_qty: { label: "Terjual", color: "hsl(var(--secondary))" },
    },
};

const StatCard = ({ title, value, subtext, icon: Icon, trend }) => (
    <Card className="h-full shadow-sm p-2">
        <CardHeader className="p-2 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-medium text-muted-foreground truncate pr-2">
                {title}
            </CardTitle>
            <Icon
                className={`h-4 w-4 ${trend === "down" ? "text-destructive" : "text-muted-foreground"}`}
            />
        </CardHeader>
        <CardContent className="p-2 pt-1">
            <div
                className={`text-lg font-semibold truncate ${trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : ""}`}
            >
                {value}
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
                {subtext}
            </p>
        </CardContent>
    </Card>
);

const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="h-full flex flex-col items-center justify-center py-6 text-muted-foreground text-center">
        <div className="p-2 bg-muted/40 rounded-full mb-2">
            <Icon className="h-4 w-4 opacity-40" />
        </div>
        <p className="text-xs font-medium text-foreground opacity-80">
            {title}
        </p>
        <p className="text-[11px] text-muted-foreground opacity-60 mt-1">
            {description}
        </p>
    </div>
);

const SalesChart = ({ data, dateRangeLabel }) => (
    <Card className="lg:col-span-8 h-full flex flex-col shadow-sm p-2">
        <CardHeader className="pb-1 p-2">
            <CardTitle className="text-sm">Tren Penjualan</CardTitle>
            <CardDescription className="text-[11px]">
                Performa harian {dateRangeLabel}
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
            {data?.length > 0 ? (
                <ChartContainer
                    config={chartConfigs.sales}
                    className="h-[220px] w-full"
                >
                    <BarChart data={data}>
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                        />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            tickFormatter={(v) => v.slice(0, 5)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            width={40}
                            tickFormatter={(v) => `Rp${v / 1000}k`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(v) => formatCurrency(v)}
                                />
                            }
                        />
                        <Bar
                            dataKey="total"
                            fill="var(--color-total)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            ) : (
                <EmptyState
                    icon={BarChart2}
                    title="Data kosong"
                    description="Belum ada penjualan."
                />
            )}
        </CardContent>
    </Card>
);

const ActivityList = ({ data }) => (
    <Card className="lg:col-span-4 h-full flex flex-col shadow-sm p-2">
        <CardHeader className="p-2 pb-1">
            <CardTitle className="text-sm">Aktivitas Terbaru</CardTitle>
            <CardDescription className="text-[11px]">
                Mutasi stok terakhir
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto pr-1">
            {data?.length > 0 ? (
                <div className="space-y-2">
                    {data.map((movement) => (
                        <DashboardMobileCard
                            key={movement.id}
                            movement={movement}
                            compact={true}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={Activity}
                    title="Belum ada aktivitas"
                    description="Belum ada data."
                />
            )}
        </CardContent>
    </Card>
);

const TopProductsChart = ({ data }) => (
    <Card className="lg:col-span-6 h-full flex flex-col shadow-sm p-2">
        <CardHeader className="p-2 pb-1">
            <CardTitle className="text-sm">Top 5 Produk</CardTitle>
            <CardDescription className="text-[11px]">
                Berdasarkan kuantitas
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
            {data?.length > 0 ? (
                <ChartContainer
                    config={chartConfigs.topProducts}
                    className="h-[200px] w-full"
                >
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ left: 0, right: 0 }}
                    >
                        <CartesianGrid
                            horizontal={false}
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            width={110}
                            fontSize={10}
                        />
                        <XAxis dataKey="total_qty" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    indicator="line"
                                />
                            }
                        />
                        <Bar
                            dataKey="total_qty"
                            fill="var(--color-total_qty)"
                            radius={4}
                            barSize={18}
                        />
                    </BarChart>
                </ChartContainer>
            ) : (
                <EmptyState
                    icon={PackageX}
                    title="Tidak ada data"
                    description="Belum ada produk terjual."
                />
            )}
        </CardContent>
    </Card>
);

const PaymentMethodsChart = ({ data }) => {
    const pieData =
        data?.length > 0
            ? data.map((item, index) => ({
                  ...item,
                  fill: `hsl(var(--chart-${(index % 5) + 1}))`,
              }))
            : [];

    return (
        <Card className="lg:col-span-6 h-full flex flex-col shadow-sm p-2">
            <CardHeader className="p-2 pb-1">
                <CardTitle className="text-sm">Metode Pembayaran</CardTitle>
                <CardDescription className="text-[11px]">
                    Distribusi channel
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                {data?.length > 0 ? (
                    <ChartContainer
                        config={chartConfigs.payment}
                        className="h-[180px] w-[180px]"
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
                                innerRadius={45}
                                outerRadius={70}
                                strokeWidth={2}
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
                                                    <tspan className="text-xl font-bold">
                                                        {pieData.reduce(
                                                            (acc, curr) =>
                                                                acc +
                                                                curr.count,
                                                            0,
                                                        )}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={
                                                            (viewBox.cy || 0) +
                                                            16
                                                        }
                                                        className="text-[10px] text-muted-foreground"
                                                    >
                                                        Transaksi
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                    }}
                                />
                            </Pie>
                            <ChartLegend
                                content={<ChartLegendContent nameKey="name" />}
                                className="mt-2 flex-wrap gap-1 [&>*]:basis-1/3"
                            />
                        </PieChart>
                    </ChartContainer>
                ) : (
                    <EmptyState
                        icon={PieChartIcon}
                        title="Tidak ada data"
                        description="Tidak ada transaksi."
                    />
                )}
            </CardContent>
        </Card>
    );
};
