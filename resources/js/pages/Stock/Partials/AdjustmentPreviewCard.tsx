import { Label } from '@/components/ui/label';
import { cn, formatNumber } from '@/lib/utils';
import { ArrowRight, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function AdjustmentPreviewCard({ mode, onModeChange, currentStock, inputQty, unit, disabled }) {
    const { t } = useTranslation();
    const parsedInput = parseFloat(inputQty) || 0;
    const curr = currentStock !== null ? parseFloat(currentStock) : null;

    const calcNewStock = () => {
        if (curr === null) return 0;
        if (mode === 'reduction') return Math.max(0, curr - parsedInput);
        if (mode === 'addition') return curr + parsedInput;
        return parsedInput;
    };

    const calcDiff = () => {
        if (curr === null) return 0;
        if (mode === 'reduction') return -parsedInput;
        if (mode === 'addition') return parsedInput;
        return parsedInput - curr;
    };

    const newStock = calcNewStock();
    const diff = calcDiff();

    const modes = [
        { value: 'absolute', label: t('ui.mode_stock_opname'), icon: RefreshCw },
        { value: 'reduction', label: t('ui.mode_reduction'), icon: TrendingDown },
        { value: 'addition', label: t('ui.mode_addition'), icon: TrendingUp },
    ];

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">{t('ui.adjustment_mode')}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {modes.map(({ value, label, icon: Icon }) => {
                        const isSelected = mode === value;
                        return (
                            <button
                                type="button"
                                key={value}
                                disabled={disabled}
                                onClick={() => !disabled && onModeChange(value)}
                                className={cn(
                                    'flex items-center gap-2.5 border p-2.5 rounded-lg text-left transition-all',
                                    disabled ? 'opacity-50 cursor-not-allowed bg-muted/20' : 'cursor-pointer',
                                    isSelected && !disabled
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary font-medium text-foreground'
                                        : !disabled && 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <div className={cn(
                                    'w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors',
                                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                                )}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                                </div>
                                <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                                <span className="text-xs">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {curr !== null && inputQty !== '' && (
                <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2.5">
                    <p className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>{t('ui.adjustment_preview')}</span>
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', diff < 0 ? 'bg-destructive/10 text-destructive' : diff > 0 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                            {diff > 0 ? `+${formatNumber(diff)}` : formatNumber(diff)} {unit}
                        </span>
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground bg-background p-2.5 rounded-md border">
                        <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('ui.current_system_stock')}</p>
                            <p className="font-semibold text-foreground">{formatNumber(curr)} {unit}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                        <div className="space-y-0.5 text-right">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('ui.new_stock_result')}</p>
                            <p className="font-bold text-primary">{formatNumber(newStock)} {unit}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
