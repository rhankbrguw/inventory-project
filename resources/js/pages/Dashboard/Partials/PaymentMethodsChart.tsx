import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltip } from '@/components/ui/chart';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const chartVariants: any = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut', delay: 0.1 } }
};

export default function PaymentMethodsChart({ data, t }: { data?: any[]; t: any }) {
    const pieData = (data ?? []).map((item: any, idx: number) => ({ ...item, fill: CHART_COLORS[idx % CHART_COLORS.length] }));
    const totalTransactions = pieData.reduce((acc: number, curr: any) => acc + curr.count, 0);

    return (
        <motion.div initial="hidden" animate="visible" variants={chartVariants} className="h-full">
            <Card className="flex flex-col h-full border-border/70 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-1 pt-3.5 px-4">
                    <CardTitle className="text-sm font-semibold tracking-tight">{t('ui.payment_methods')}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">{t('ui.payment_distribution')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center pt-1 pb-3 px-3">
                    {data && data.length > 0 ? (
                        <div className="space-y-3">
                            <div className="relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height={120}>
                                    <PieChart>
                                        <Pie data={pieData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={36} outerRadius={52} paddingAngle={4} strokeWidth={2} stroke="hsl(var(--background))" isAnimationActive animationDuration={900}>
                                            {pieData.map((e, idx) => <Cell key={`cell-${idx}`} fill={e.fill} className="transition-all duration-300 hover:opacity-80" />)}
                                        </Pie>
                                        <ChartTooltip content={({ active, payload }: any) => (!active || !payload?.length ? null : (
                                            <div className="bg-background/95 backdrop-blur-md border border-border/80 rounded-lg shadow-xl px-2.5 py-1.5 text-xs">
                                                <p className="font-semibold text-foreground">{payload[0].name}</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">{t('ui.transaction_count', { count: formatNumber(payload[0].value) })} ({((payload[0].value / totalTransactions) * 100).toFixed(1)}%)</p>
                                            </div>
                                        ))} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xs font-bold text-foreground">{formatNumber(totalTransactions)}</span>
                                    <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{t('ui.total') || 'Total'}</span>
                                </div>
                            </div>
                            <div className="space-y-1.5 pt-0.5">
                                {pieData.map((item, idx) => {
                                    const percent = totalTransactions > 0 ? (item.count / totalTransactions) * 100 : 0;
                                    return (
                                        <div key={idx} className="group flex items-center justify-between text-[11px] px-1 py-0.5 rounded hover:bg-muted/40 transition-colors">
                                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                                                <span className="truncate font-medium text-foreground">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="font-semibold text-foreground">{formatNumber(item.count)}</span>
                                                <span className="text-[10px] text-muted-foreground w-8 text-right font-mono">({percent.toFixed(0)}%)</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <EmptyState icon={PieChartIcon} title={t('ui.no_data')} description={t('ui.no_payment_data_desc')} />
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
