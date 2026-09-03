import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { PackageX } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';

const chartVariants: any = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut', delay: 0.15 } }
};

export default function TopProductsChart({ data, t }: { data?: any[]; t: any }) {
    const chartConfig = {
        total_qty: { label: t('ui.sold'), color: 'hsl(var(--chart-2))' }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={chartVariants} className="h-full">
            <Card className="flex flex-col h-full border-border/70 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-1 pt-3.5 px-4">
                    <CardTitle className="text-sm font-semibold tracking-tight">{t('ui.top_products')}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">{t('ui.top_5_by_qty')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center pt-1 pb-3 px-3">
                    {data && data.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[175px] w-full">
                            <BarChart data={data} layout="vertical" margin={{ left: -10, right: 35, top: 4, bottom: 4 }}>
                                <defs>
                                    <linearGradient id="gradientTopBar" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.75} />
                                        <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.6)" />
                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={95} fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                <XAxis dataKey="total_qty" type="number" hide />
                                <ChartTooltip cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} content={({ active, payload }: any) => (!active || !payload?.length ? null : (
                                    <div className="bg-background/95 backdrop-blur-md border border-border/80 rounded-lg shadow-xl px-2.5 py-1.5 text-xs">
                                        <p className="font-semibold text-foreground">{payload[0].payload.name}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{t('ui.sold')}: <span className="font-bold text-foreground">{formatNumber(payload[0].value)}</span></p>
                                    </div>
                                ))} />
                                <Bar dataKey="total_qty" fill="url(#gradientTopBar)" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive animationDuration={900} animationEasing="ease-out" label={{ position: 'right', formatter: (numValue: any) => formatNumber(numValue), fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} />
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <EmptyState icon={PackageX} title={t('ui.no_data')} description={t('ui.no_products_sold_desc')} />
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
