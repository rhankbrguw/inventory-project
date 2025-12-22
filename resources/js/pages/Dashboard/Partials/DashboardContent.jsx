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
    Cell,
    LineChart,
    Line,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
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
    AlertTriangle,
    Receipt,
    Percent,
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
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                <StatCard
                    title="Pendapatan"
                    value={formatCurrency(stats.revenue)}
                    subtext={`${formatNumber(stats.sales_count)} transaksi`}
                    icon={DollarSign}
                    iconBg="bg-primary/10"
                    iconColor="text-primary"
                />
                <StatCard
                    title="Profit Bersih"
                    value={formatCurrency(stats.net_profit)}
                    subtext={`Margin ${stats.gross_margin.toFixed(1)}%`}
                    icon={stats.net_profit >= 0 ? TrendingUp : TrendingDown}
                    iconBg={stats.net_profit >= 0 ? "bg-success/10" : "bg-destructive/10"}
                    iconColor={stats.net_profit >= 0 ? "text-success" : "text-destructive"}
                    valueColor={stats.net_profit >= 0 ? "text-success" : "text-destructive"}
                />
                <StatCard
                    title="Pembelian"
                    value={formatCurrency(stats.total_purchases)}
                    subtext={`${formatNumber(stats.purchase_count)} transaksi`}
                    icon={ShoppingCart}
                    iconBg="bg-warning/10"
                    iconColor="text-warning"
                />
                <StatCard
                    title="Nilai Stok"
                    value={formatCurrency(stats.inventory_value)}
                    subtext={
                        stats.low_stock_count > 0
                            ? `${formatNumber(stats.low_stock_count)} item butuh restock`
                            : "Stok normal"
                    }
                    icon={stats.low_stock_count > 0 ? AlertTriangle : Package}
                    iconBg={stats.low_stock_count > 0 ? "bg-warning/10" : "bg-info/10"}
                    iconColor={stats.low_stock_count > 0 ? "text-warning" : "text-info"}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">
                            Penjualan vs Pembelian
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Perbandingan trend {dateRangeLabel}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 pb-4 pl-0">
                        {charts.comparison?.length > 0 ? (
                            <ChartContainer
                                config={{
                                    sales: {
                                        label: "Penjualan",
                                        color: "hsl(var(--success))",
                                    },
                                    purchases: {
                                        label: "Pembelian",
                                        color: "hsl(var(--destructive))",
                                    },
                                }}
                                className="h-[200px] sm:h-[240px] w-full"
                            >
                                <LineChart
                                    data={charts.comparison}
                                    margin={{
                                        top: 5,
                                        right: 20,
                                        left: 10,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="hsl(var(--border))"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={10}
                                        tickMargin={8}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={10}
                                        width={55}
                                        tickFormatter={(v) =>
                                            `${(v / 1000).toFixed(0)}k`
                                        }
                                    />
                                    <ChartTooltip
                                        content={({ active, payload }) => {
                                            if (
                                                active &&
                                                payload &&
                                                payload.length
                                            ) {
                                                return (
                                                    <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2">
                                                        <p className="text-xs font-medium mb-1">
                                                            {
                                                                payload[0]
                                                                    .payload
                                                                    .date
                                                            }
                                                        </p>
                                                        {payload.map(
                                                            (entry, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between gap-3 text-xs"
                                                                >
                                                                    <span className="text-muted-foreground">
                                                                        {entry.name ===
                                                                            "sales"
                                                                            ? "Penjualan"
                                                                            : "Pembelian"}
                                                                        :
                                                                    </span>
                                                                    <span
                                                                        className="font-bold"
                                                                        style={{
                                                                            color:
                                                                                entry.name ===
                                                                                    "sales"
                                                                                    ? "hsl(var(--success))"
                                                                                    : "hsl(var(--destructive))",
                                                                        }}
                                                                    >
                                                                        {formatCurrency(
                                                                            entry.value,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend
                                        content={<ChartLegendContent />}
                                        wrapperStyle={{
                                            paddingTop: "8px",
                                            fontSize: "12px",
                                        }}
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

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <TopProductsChart data={charts.top_items} />
                <PaymentMethodsChart data={charts.channels} />
                <QuickStatsCard stats={stats} dateRangeLabel={dateRangeLabel} />
            </div>
        </div>
    );
}

const StatCard = ({
    title,
    value,
    subtext,
    icon: Icon,
    iconBg,
    iconColor,
    valueColor,
}) => (
    <Card className="border-l-4 border-l-transparent hover:border-l-primary/50 transition-all">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
                {title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
            <div
                className={`text-xl sm:text-2xl font-bold ${valueColor || ""}`}
            >
                {value}
            </div>
            <p className="text-xs text-muted-foreground">{subtext}</p>
        </CardContent>
    </Card>
);

const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-muted-foreground">
        <div className="p-3 bg-muted/30 rounded-full mb-3">
            <Icon className="h-6 w-6 opacity-40" />
        </div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
);

const ActivityList = ({ data }) => (
    <Card className="flex flex-col">
        <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
                Aktivitas Terbaru
            </CardTitle>
            <CardDescription className="text-xs">
                6 mutasi stok terakhir
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto pt-0 px-3 pb-3">
            {data?.length > 0 ? (
                <div className="space-y-0">
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
    <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
                Produk Terlaris
            </CardTitle>
            <CardDescription className="text-xs">
                Top 5 berdasarkan kuantitas
            </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pr-2">
            {data?.length > 0 ? (
                <ChartContainer
                    config={{
                        total_qty: {
                            label: "Terjual",
                            color: "hsl(var(--chart-2))",
                        },
                    }}
                    className="h-[220px] w-full"
                >
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ left: 0, right: 50 }}
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
                            width={90}
                            fontSize={11}
                        />
                        <XAxis dataKey="total_qty" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    indicator="line"
                                    formatter={(value) => formatNumber(value)}
                                />
                            }
                        />
                        <Bar
                            dataKey="total_qty"
                            fill="var(--color-total_qty)"
                            radius={4}
                            barSize={18}
                            label={{
                                position: "right",
                                formatter: (value) => formatNumber(value),
                                fontSize: 11,
                                fill: "hsl(var(--foreground))",
                            }}
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

const CHART_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

const PaymentMethodsChart = ({ data }) => {
    const pieData =
        data?.length > 0
            ? data.map((item, index) => ({
                ...item,
                fill: CHART_COLORS[index % CHART_COLORS.length],
            }))
            : [];

    const totalTransactions = pieData.reduce(
        (acc, curr) => acc + curr.count,
        0,
    );

    const renderCustomLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
    }) => {
        if (percent < 0.05) return null;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                className="font-bold text-xs"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                    Metode Pembayaran
                </CardTitle>
                <CardDescription className="text-xs">
                    Distribusi pembayaran penjualan
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                {data?.length > 0 ? (
                    <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="count"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    strokeWidth={3}
                                    stroke="hsl(var(--background))"
                                    label={renderCustomLabel}
                                    labelLine={false}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                        />
                                    ))}
                                </Pie>
                                <ChartTooltip
                                    content={({ active, payload }) => {
                                        if (
                                            active &&
                                            payload &&
                                            payload.length
                                        ) {
                                            const data = payload[0];
                                            const percentage = (
                                                (data.value /
                                                    totalTransactions) *
                                                100
                                            ).toFixed(1);
                                            return (
                                                <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2">
                                                    <p className="text-xs font-medium">
                                                        {data.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatNumber(
                                                            data.value,
                                                        )}{" "}
                                                        transaksi ({percentage}
                                                        %)
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 pt-2">
                            {pieData.map((item, index) => {
                                const percentage = (
                                    (item.count / totalTransactions) *
                                    100
                                ).toFixed(1);
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{
                                                    backgroundColor: item.fill,
                                                }}
                                            />
                                            <span className="truncate font-medium">
                                                {item.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="font-bold">
                                                {formatNumber(item.count)}
                                            </span>
                                            <span className="text-muted-foreground">
                                                ({percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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
    <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
                Ringkasan Cepat
            </CardTitle>
            <CardDescription className="text-xs">
                Metrik {dateRangeLabel}
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
            <QuickStatItem
                icon={Receipt}
                label="Total Transaksi"
                value={formatNumber(stats.sales_count + stats.purchase_count)}
                subvalue={`${formatNumber(stats.sales_count)} jual, ${formatNumber(stats.purchase_count)} beli`}
                iconBg="bg-highlight/10"
                iconColor="text-highlight"
            />
            <QuickStatItem
                icon={Percent}
                label="Gross Margin"
                value={`${stats.gross_margin.toFixed(1)}%`}
                subvalue="Dari penjualan"
                iconBg={stats.gross_margin > 20 ? "bg-success/10" : "bg-muted"}
                iconColor={stats.gross_margin > 20 ? "text-success" : "text-muted-foreground"}
            />
            <QuickStatItem
                icon={Package}
                label="Nilai Aset Stok"
                value={formatCurrency(stats.inventory_value)}
                subvalue={
                    stats.low_stock_count > 0
                        ? `${formatNumber(stats.low_stock_count)} item perlu restock`
                        : "Semua stok normal"
                }
                iconBg={stats.low_stock_count > 0 ? "bg-warning/10" : "bg-info/10"}
                iconColor={stats.low_stock_count > 0 ? "text-warning" : "text-info"}
            />
            <QuickStatItem
                icon={stats.net_profit >= 0 ? TrendingUp : TrendingDown}
                label="Net Profit"
                value={formatCurrency(stats.net_profit)}
                subvalue="Setelah HPP"
                iconBg={stats.net_profit >= 0 ? "bg-success/10" : "bg-destructive/10"}
                iconColor={stats.net_profit >= 0 ? "text-success" : "text-destructive"}
            />
        </CardContent>
    </Card>
);

const QuickStatItem = ({
    icon: Icon,
    label,
    value,
    subvalue,
    iconBg,
    iconColor,
}) => (
    <div className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
        <div className={`p-2 rounded-lg flex-shrink-0 ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="text-base font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subvalue}</p>
        </div>
    </div>
);
