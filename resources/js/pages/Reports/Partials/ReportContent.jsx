import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    TrendingUp,
    Package,
    Receipt,
    ShoppingCart,
    BarChart2,
    PackageX,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import ReportMobileCard from './ReportMobileCard';
import { topProductsColumns } from '@/constants/tableColumns';

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
                className={`text-xl sm:text-2xl font-bold ${valueColor || ''}`}
            >
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
                    <CardTitle className="text-base font-semibold">
                        Tren Penjualan
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Grafik penjualan harian dalam periode terpilih
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                    {charts.daily_trend && charts.daily_trend.length > 0 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={charts.daily_trend}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -20,
                                        bottom: 0,
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
                                        tickMargin={8}
                                        fontSize={11}
                                    />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            `${(value / 1000000).toFixed(0)}M`
                                        }
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={11}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (
                                                active &&
                                                payload &&
                                                payload.length
                                            ) {
                                                return (
                                                    <div className="bg-popover border border-border px-3 py-2 rounded shadow-lg text-xs">
                                                        <p className="font-medium mb-1">
                                                            {
                                                                payload[0]
                                                                    .payload
                                                                    .date
                                                            }
                                                        </p>
                                                        <p className="font-semibold text-info">
                                                            {formatCurrency(
                                                                payload[0].value
                                                            )}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="hsl(var(--info))"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState
                            icon={BarChart2}
                            title="Belum ada data"
                            description="Data penjualan akan muncul setelah ada transaksi"
                        />
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Produk Terlaris
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Top 10 produk berdasarkan kuantitas dan nilai
                            penjualan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {charts.top_products &&
                        charts.top_products.length > 0 ? (
                            <>
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-xs text-muted-foreground bg-muted/30">
                                                {topProductsColumns.map(
                                                    (column, idx) => (
                                                        <th
                                                            key={idx}
                                                            className={
                                                                column.headerClassName
                                                            }
                                                        >
                                                            {column.header}
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {charts.top_products.map(
                                                (product, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b last:border-0 hover:bg-muted/10 transition-colors"
                                                    >
                                                        {topProductsColumns.map(
                                                            (column, idx) => (
                                                                <td
                                                                    key={idx}
                                                                    className={
                                                                        column.className
                                                                    }
                                                                >
                                                                    {column.cell
                                                                        ? column.cell(
                                                                              {
                                                                                  row: product,
                                                                                  index,
                                                                              }
                                                                          )
                                                                        : product[
                                                                              column
                                                                                  .accessorKey
                                                                          ]}
                                                                </td>
                                                            )
                                                        )}
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="md:hidden space-y-3">
                                    {charts.top_products.map(
                                        (product, index) => (
                                            <ReportMobileCard
                                                key={product.id || index}
                                                product={product}
                                                rank={index + 1}
                                            />
                                        )
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                                <PackageX className="h-12 w-12 mb-2 opacity-20" />
                                <p className="text-sm">
                                    Belum ada data penjualan produk
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
