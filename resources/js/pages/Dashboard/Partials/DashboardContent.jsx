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
    LineChart,
    Line,
    Legend,
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
    BarChart2,
    PieChart as PieChartIcon,
    PackageX,
    Activity,
    ShoppingCart,
    Receipt,
    Percent,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import DashboardMobileCard from "./DashboardMobileCard";

export default function DashboardContent({
    stats,
    charts,
    recentMovements,
    dateRangeLabel,
}) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                    title="Pendapatan"
                    value={formatCurrency(stats.revenue)}
                    subtext={`${stats.sales_count} transaksi`}
                    icon={DollarSign}
                    className="col-span-1"
                />
                <StatCard
                    title="Profit Bersih"
                    value={formatCurrency(stats.net_profit)}
                    subtext={`Margin ${stats.gross_margin.toFixed(1)}%`}
                    icon={stats.net_profit >= 0 ? TrendingUp : TrendingDown}
                    trend={stats.net_profit >= 0 ? "up" : "down"}
                    className="col-span-1"
                />
                <StatCard
                    title="Pembelian"
                    value={formatCurrency(stats.total_purchases)}
                    subtext={`${stats.purchase_count} transaksi`}
                    icon={ShoppingCart}
                    className="col-span-1"
                />
                <StatCard
                    title="Nilai Stok"
                    value={formatCurrency(stats.inventory_value)}
                    subtext={`${stats.low_stock_count} item rendah`}
                    icon={Package}
                    trend={stats.low_stock_count > 0 ? "warning" : "neutral"}
                    className="col-span-1"
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
                <Card className="lg:col-span-8 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            Penjualan vs Pembelian
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Perbandingan trend {dateRangeLabel}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {charts.comparison?.length > 0 ? (
                            <ChartContainer
                                config={{
                                    sales: {
                                        label: "Penjualan",
                                        color: "hsl(var(--primary))",
                                    },
                                    purchases: {
                                        label: "Pembelian",
                                        color: "hsl(var(--destructive))",
                                    },
                                }}
                                className="h-[280px] w-full"
                            >
                                <LineChart data={charts.comparison}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="hsl(var(--border))"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={11}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={11}
                                        width={55}
                                        tickFormatter={(v) =>
                                            `${(v / 1000).toFixed(0)}k`
                                        }
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                formatter={(v) =>
                                                    formatCurrency(v)
                                                }
                                            />
                                        }
                                    />
                                    <Legend
                                        content={<ChartLegendContent />}
                                        wrapperStyle={{ paddingTop: "10px" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="var(--color-sales)"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="purchases"
                                        stroke="var(--color-purchases)"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        ) : (
                            <EmptyState
                                icon={BarChart2}
                                title="Belum ada data"
                                description="Data akan muncul setelah ada transaksi"
                            />
                        )}
                    </CardContent>
                </Card>

                <ActivityList data={recentMovements.data} />
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
                <TopProductsChart data={charts.top_items} />

                <PaymentMethodsChart data={charts.channels} />

                <QuickStatsCard stats={stats} dateRangeLabel={dateRangeLabel} />
            </div>
        </div>
    );
}

const StatCard = ({ title, value, subtext, icon: Icon, trend, className }) => (
    <Card className={`shadow-sm ${className || ""}`}>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
                {title}
            </CardTitle>
            <Icon
                className={`h-4 w-4 ${trend === "down"
                        ? "text-destructive"
                        : trend === "warning"
                            ? "text-accent-foreground"
                            : trend === "up"
                                ? "text-success"
                                : "text-muted-foreground"
                    }`}
            />
        </CardHeader>
        <CardContent className="pt-0">
            <div
                className={`text-xl font-bold mb-1 ${trend === "up"
                        ? "text-success"
                        : trend === "down"
                            ? "text-destructive"
                            : ""
                    }`}
            >
                {value}
            </div>
            <p className="text-xs text-muted-foreground">{subtext}</p>
        </CardContent>
    </Card>
);

const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-muted-foreground">
        <div className="p-3 bg-muted/30 rounded-full mb-3">
            <Icon className="h-6 w-6 opacity-40" />
        </div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
);

const ActivityList = ({ data }) => (
    <Card className="lg:col-span-4 shadow-sm flex flex-col">
        <CardHeader className="pb-2">
            <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
            <CardDescription className="text-xs">
                6 mutasi stok terakhir
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto px-2 pb-2">
            {data?.length > 0 ? (
                <div className="space-y-1">
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
                    description="Mutasi stok akan muncul di sini"
                />
            )}
        </CardContent>
    </Card>
);

const TopProductsChart = ({ data }) => (
    <Card className="lg:col-span-4 shadow-sm">
        <CardHeader className="pb-2">
            <CardTitle className="text-base">Produk Terlaris</CardTitle>
            <CardDescription className="text-xs">
                Top 5 berdasarkan kuantitas
            </CardDescription>
        </CardHeader>
        <CardContent>
            {data?.length > 0 ? (
                <ChartContainer
                    config={{
                        total_qty: {
                            label: "Terjual",
                            color: "hsl(var(--secondary))",
                        },
                    }}
                    className="h-[220px] w-full"
                >
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ left: 0, right: 10 }}
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
                            width={100}
                            fontSize={11}
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
                            barSize={20}
                        />
                    </BarChart>
                </ChartContainer>
            ) : (
                <EmptyState
                    icon={PackageX}
                    title="Belum ada data"
                    description="Produk terjual akan muncul di sini"
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

    const totalTransactions = pieData.reduce(
        (acc, curr) => acc + curr.count,
        0,
    );

    return (
        <Card className="lg:col-span-4 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Metode Pembayaran</CardTitle>
                <CardDescription className="text-xs">
                    Distribusi pembayaran penjualan
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                {data?.length > 0 ? (
                    <ChartContainer
                        config={{
                            count: { label: "Transaksi" },
                        }}
                        className="h-[220px] w-full max-w-[220px]"
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
                                innerRadius={50}
                                outerRadius={75}
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
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-2xl font-bold"
                                                    >
                                                        {totalTransactions}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={
                                                            (viewBox.cy || 0) +
                                                            20
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
                            <ChartLegend
                                content={<ChartLegendContent nameKey="name" />}
                                className="flex-wrap gap-2 text-xs"
                            />
                        </PieChart>
                    </ChartContainer>
                ) : (
                    <EmptyState
                        icon={PieChartIcon}
                        title="Belum ada data"
                        description="Data pembayaran akan muncul di sini"
                    />
                )}
            </CardContent>
        </Card>
    );
};

const QuickStatsCard = ({ stats, dateRangeLabel }) => (
    <Card className="lg:col-span-4 shadow-sm">
        <CardHeader className="pb-2">
            <CardTitle className="text-base">Ringkasan Cepat</CardTitle>
            <CardDescription className="text-xs">
                Metrik {dateRangeLabel}
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <QuickStatItem
                icon={Receipt}
                label="Total Transaksi"
                value={`${stats.sales_count + stats.purchase_count}`}
                subvalue={`${stats.sales_count} jual, ${stats.purchase_count} beli`}
            />
            <QuickStatItem
                icon={Percent}
                label="Gross Margin"
                value={`${stats.gross_margin.toFixed(1)}%`}
                subvalue="Dari penjualan"
                trend={stats.gross_margin > 20 ? "up" : "neutral"}
            />
            <QuickStatItem
                icon={Package}
                label="Nilai Aset Stok"
                value={formatCurrency(stats.inventory_value)}
                subvalue={`${stats.low_stock_count} item perlu restock`}
                trend={stats.low_stock_count > 0 ? "warning" : "neutral"}
            />
            <QuickStatItem
                icon={TrendingUp}
                label="Net Profit"
                value={formatCurrency(stats.net_profit)}
                subvalue="Setelah HPP"
                trend={stats.net_profit >= 0 ? "up" : "down"}
            />
        </CardContent>
    </Card>
);

const QuickStatItem = ({ icon: Icon, label, value, subvalue, trend }) => (
    <div className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
        <div
            className={`p-2 rounded-lg ${trend === "up"
                    ? "bg-success/10 text-success"
                    : trend === "warning"
                        ? "bg-accent/50 text-accent-foreground"
                        : trend === "down"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted/50 text-muted-foreground"
                }`}
        >
            <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p
                className={`text-sm font-semibold ${trend === "up"
                        ? "text-success"
                        : trend === "down"
                            ? "text-destructive"
                            : ""
                    }`}
            >
                {value}
            </p>
            <p className="text-xs text-muted-foreground">{subvalue}</p>
        </div>
    </div>
);
