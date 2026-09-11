import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

const chartVariants: any = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
};

export const EmptyState = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground">
        <div className="p-3 bg-muted/30 rounded-full mb-3">
            <Icon className="h-6 w-6 opacity-40" />
        </div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
);

export default function DailySalesChart({ data }: { data?: any[] }) {
    const { t } = useTranslation();

    return (
        <motion.div initial="hidden" animate="visible" variants={chartVariants}>
            <Card className="border-border/70 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="text-base font-semibold tracking-tight">
                        {t('ui.daily_sales_trend')}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        {t('ui.daily_sales_chart_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                    {data && data.length > 0 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 12, right: 10, left: -15, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gradientReportSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.32} />
                                            <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} interval="preserveStartEnd" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                    <YAxis domain={[0, 'auto']} tickFormatter={(numValue: number) => `${(numValue / 1000000).toFixed(0)}M`} tickLine={false} axisLine={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                    <Tooltip cursor={{ stroke: 'hsl(var(--muted-foreground) / 0.35)', strokeDasharray: '3 3' }} content={({ active, payload }: any) => (!active || !payload?.length ? null : (
                                        <div className="bg-background/95 backdrop-blur-md border border-border/80 px-3 py-2 rounded-lg shadow-xl text-xs">
                                            <p className="font-semibold text-foreground mb-1 pb-1 border-b border-border/50">{payload[0].payload.date}</p>
                                            <p className="font-bold text-info">{formatCurrency(payload[0].value)}</p>
                                        </div>
                                    ))} />
                                    <Area type="monotone" dataKey="sales" stroke="hsl(var(--info))" strokeWidth={2.4} fillOpacity={1} fill="url(#gradientReportSales)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--background))' }} connectNulls isAnimationActive animationDuration={900} animationEasing="ease-out" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState icon={BarChart2} title={t('ui.no_data')} description={t('ui.no_sales_data_desc')} />
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
