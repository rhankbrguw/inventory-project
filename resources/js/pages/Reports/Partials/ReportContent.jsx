import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart";
import {
    TrendingUp,
    Package,
    Receipt,
    ShoppingCart,
    BarChart2,
    PackageX,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import MobileCardList from "@/components/MobileCardList";
import ReportMobileCard from "./ReportMobileCard";

const StatCard = ({ title, value, subtext, icon: Icon, iconBg, iconColor, valueColor }) => (
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
            <div className={`text-xl sm:text-2xl font-bold ${valueColor || ""}`}>
                {value}
            </div>
            <p className="text-xs text-muted-foreground">{subtext}</p>
        </CardContent>
    </Card>
);

const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground">
        <div className="p-3 bg-muted/30 rounded-full mb-3">
            <Icon className="h-6 w-6 opacity-40" />
        </div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
);

export default function ReportContent({ stats, charts }) {

    const CHART_CONFIG = {
        sales: {
            label: "Penjualan",
            color: "hsl(var(--chart-1))",
        },
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                <StatCard
                    title="Total Penjualan"
                    value={formatCurrency(stats.total_sales)}
                    subtext={`${formatNumber(stats.transaction_count)} transaksi`}
                    icon={Receipt}
                    iconBg="bg-success/10"
                    iconColor="text-success"
                    valueColor="text-success"
                />
                <StatCard
                    title="Item Terjual"
                    value={formatNumber(stats.total_items_sold)}
                    subtext="Total unit"
                    icon={Package}
                    iconBg="bg-info/10"
                    iconColor="text-info"
                />
                <StatCard
                    title="Rata-rata"
                    value={formatCurrency(stats.average_transaction)}
                    subtext="Per transaksi"
                    icon={TrendingUp}
                    iconBg="bg-primary/10"
                    iconColor="text-primary"
                />
                <StatCard
                    title="Total Transaksi"
                    value={formatNumber(stats.transaction_count)}
                    subtext="Total order"
                    icon={ShoppingCart}
                    iconBg="bg-highlight/10"
                    iconColor="text-highlight"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Tren Penjualan</CardTitle>
                    <CardDescription className="text-xs">Grafik penjualan harian dalam periode terpilih</CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                    {charts.daily_trend && charts.daily_trend.length > 0 ? (
                        <ChartContainer config={CHART_CONFIG} className="h-[350px] w-full">
                            <LineChart data={charts.daily_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    fontSize={11}
                                />
                                <YAxis
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={11}
                                />
                                <ChartTooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-popover border border-border px-3 py-2 rounded shadow-lg text-xs">
                                                    <p className="font-medium mb-1">{payload[0].payload.date}</p>
                                                    <p className="font-semibold" style={{ color: "hsl(var(--chart-1))" }}>{formatCurrency(payload[0].value)}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="var(--color-sales)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                    ) : (
                        <EmptyState
                            icon={BarChart2}
                            title="Belum ada data"
                            description="Data penjualan akan muncul setelah ada transaksi"
                        />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Produk Terlaris
                    </CardTitle>
                    <CardDescription className="text-xs">Top 10 produk berdasarkan kuantitas dan nilai penjualan</CardDescription>
                </CardHeader>
                <CardContent>
                    {charts.top_products && charts.top_products.length > 0 ? (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-xs text-muted-foreground">
                                            <th className="text-left py-3 px-2 font-medium">#</th>
                                            <th className="text-left py-3 px-2 font-medium">Produk</th>
                                            <th className="text-left py-3 px-2 font-medium">SKU</th>
                                            <th className="text-right py-3 px-2 font-medium">Qty</th>
                                            <th className="text-right py-3 px-2 font-medium">Nilai Penjualan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {charts.top_products.map((product, index) => (
                                            <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-2 text-sm font-medium text-muted-foreground">{index + 1}</td>
                                                <td className="py-3 px-2 text-sm font-medium">{product.name}</td>
                                                <td className="py-3 px-2 text-xs text-muted-foreground font-mono">{product.sku}</td>
                                                <td className="py-3 px-2 text-sm text-right font-mono">{formatNumber(product.quantity)}</td>
                                                <td className="py-3 px-2 text-sm text-right font-semibold">{formatCurrency(product.revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 font-semibold">
                                            <td colSpan="3" className="py-3 px-2 text-sm">Total</td>
                                            <td className="py-3 px-2 text-sm text-right font-mono">
                                                {formatNumber(charts.top_products.reduce((sum, p) => sum + p.quantity, 0))}
                                            </td>
                                            <td className="py-3 px-2 text-sm text-right">
                                                {formatCurrency(charts.top_products.reduce((sum, p) => sum + p.revenue, 0))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div className="md:hidden">
                                <MobileCardList
                                    data={charts.top_products}
                                    renderItem={(product, index) => (
                                        <ReportMobileCard
                                            key={index}
                                            product={product}
                                            rank={index + 1}
                                        />
                                    )}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                            <PackageX className="h-12 w-12 mb-2 opacity-20" />
                            <p className="text-sm">Belum ada data penjualan produk</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
