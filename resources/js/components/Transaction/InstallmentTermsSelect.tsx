import type * as React from 'react';
import FormField from '@/components/FormField';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

type InstallmentTermsSelectProps = {
    formData: Record<string, any>;
    setFormData: (key: string, value: any) => void;
    errors: Record<string, string | string[] | undefined>;
    isCash?: boolean;
};

export default function InstallmentTermsSelect({ formData, setFormData, errors, isCash = false }: InstallmentTermsSelectProps) {
    const { t } = useTranslation();
    const hasInstallment = !isCash && Number.parseInt(String(formData.installment_terms ?? '1'), 10) > 1;

    return (
        <>
            <FormField label={t('ui.payment_terms')} error={errors.installment_terms}>
                <RadioGroup
                    value={isCash ? '1' : String(formData.installment_terms ?? '1')}
                    onValueChange={(value) => {
                        if (isCash) return;
                        setFormData('installment_terms', value);
                        if (value === '1') setFormData('interest_rate', '0');
                    }}
                    className="grid grid-cols-3 gap-2"
                >
                    {[
                        { value: '1', label: t('ui.full_payment'), disabled: false },
                        { value: '2', label: t('ui.installment_2x'), disabled: isCash },
                        { value: '3', label: t('ui.installment_3x'), disabled: isCash },
                    ].map(({ value, label, disabled }) => (
                        <div
                            key={value}
                            className={cn(
                                'flex items-center justify-center space-x-2 border p-2.5 rounded-md transition-colors',
                                disabled
                                    ? 'opacity-40 cursor-not-allowed bg-muted/20 border-dashed'
                                    : 'cursor-pointer',
                                (isCash ? '1' : String(formData.installment_terms ?? '1')) === value && !disabled
                                    ? 'border-primary bg-primary/5'
                                    : !disabled && 'hover:bg-muted/50'
                            )}
                        >
                            <RadioGroupItem value={value} id={`inst-${value}`} disabled={disabled} />
                            <Label
                                htmlFor={`inst-${value}`}
                                className={cn('text-xs font-medium', disabled ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer')}
                            >
                                {label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
                {isCash && (
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        {t('ui.cash_full_payment_only')}
                    </p>
                )}
            </FormField>

            {hasInstallment && (
                <FormField
                    label={t('ui.interest_rate')}
                    htmlFor="interest_rate"
                    error={errors.interest_rate}
                >
                    <div className="space-y-1.5">
                        <Input
                            id="interest_rate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={String(formData.interest_rate ?? '')}
                            onChange={(e) => setFormData('interest_rate', e.target.value)}
                            className="h-9 text-xs"
                            placeholder="0"
                        />
                        <p className="text-[10px] text-muted-foreground flex items-start gap-1">
                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {t('ui.interest_rate_hint')}
                        </p>
                    </div>
                </FormField>
            )}
        </>
    );
}
