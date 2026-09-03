import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, CartesianGrid, AreaChart, Area, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartLegendContent } from '@/components/ui/chart';
import { BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';
import useTranslation from '@/hooks/useTranslation';

const chartVariants: any = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export default function SalesVsPurchasesChart({ data, dateRangeLabel }: { data?: any[]; dateRangeLabel?: string }) {
    const { t } = useTranslation();
    const chartConfig = {
        sales: { label: t('ui.sales_label'), color: 'hsl(var(--success))' },
        purchases: { label: t('ui.purchases_label'), color: 'hsl(var(--destructive))' }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={chartVariants} className="lg:col-span-2 h-full">
            <Card className="flex flex-col h-full border-border/70 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-1 pt-3.5 px-4">
                    <CardTitle className="text-sm font-semibold tracking-tight">{t('ui.sales_vs_purchases')}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">{t('ui.comparison_trend', { period: dateRangeLabel })}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center pt-1 pb-3 pl-0 pr-3">
                    {data && data.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[175px] sm:h-[195px] w-full">
                            <AreaChart data={data} margin={{ top: 8, right: 15, left: 5, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradientSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.28} />
                                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="gradientPurchases" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.24} />
                                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} tickMargin={6} minTickGap={24} interval="preserveStartEnd" />
                                <YAxis domain={[0, 'auto']} tickLine={false} axisLine={false} fontSize={10} width={48} tickFormatter={(numValue: number) => `${(numValue / 1000).toFixed(0)}k`} />
                                <ChartTooltip cursor={{ stroke: 'hsl(var(--muted-foreground) / 0.35)', strokeDasharray: '3 3' }} content={({ active, payload }: any) => (!active || !payload?.length ? null : (
                                    <div className="bg-background/95 backdrop-blur-md border border-border/80 rounded-lg shadow-xl px-3 py-2 text-xs">
                                        <p className="font-semibold text-foreground mb-1.5 pb-1 border-b border-border/50">{payload[0].payload.date}</p>
                                        {payload.map((e: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.name === 'sales' ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }} />
                                                    <span className="text-muted-foreground">{e.name === 'sales' ? t('ui.sales_label') : t('ui.purchases_label')}:</span>
                                                </div>
                                                <span className="font-semibold" style={{ color: e.name === 'sales' ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>{formatCurrency(e.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))} />
                                <Legend content={<ChartLegendContent />} wrapperStyle={{ paddingTop: '6px', fontSize: '11px' }} />
                                <Area type="monotone" dataKey="sales" stroke="hsl(var(--success))" strokeWidth={2.2} fillOpacity={1} fill="url(#gradientSales)" dot={false} activeDot={{ r: 4.5, strokeWidth: 2, stroke: 'hsl(var(--background))' }} connectNulls isAnimationActive animationDuration={900} animationEasing="ease-out" />
                                <Area type="monotone" dataKey="purchases" stroke="hsl(var(--destructive))" strokeWidth={2.2} fillOpacity={1} fill="url(#gradientPurchases)" dot={false} activeDot={{ r: 4.5, strokeWidth: 2, stroke: 'hsl(var(--background))' }} connectNulls isAnimationActive animationDuration={900} animationEasing="ease-out" />
                            </AreaChart>
                        </ChartContainer>
                    ) : (
                        <EmptyState icon={BarChart2} title={t('ui.no_data')} description={t('ui.no_data_desc')} />
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
