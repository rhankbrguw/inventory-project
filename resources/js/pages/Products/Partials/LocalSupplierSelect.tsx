import FormField from '@/components/FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useTranslation from '@/hooks/useTranslation';

export default function LocalSupplierSelect({
    data,
    setData,
    errors,
    product,
    availableSuppliers,
}) {
    const { t } = useTranslation();

    return (
        <FormField
            label={t('ui.local_supplier')}
            htmlFor="default_supplier_id"
            error={errors.default_supplier_id}
            description={t('ui.local_supplier_desc')}
        >
            <Select
                value={
                    data.default_supplier_id?.toString() ||
                    'FOLLOW_GLOBAL'
                }
                onValueChange={(value) =>
                    setData(
                        'default_supplier_id',
                        value === 'FOLLOW_GLOBAL' ? '' : value
                    )
                }
            >
                <SelectTrigger>
                    <SelectValue placeholder={t('ui.local_supplier')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="FOLLOW_GLOBAL">
                        <span className="text-muted-foreground italic">
                            {t('ui.follow_global')} ({product.default_supplier?.name || t('ui.none')})
                        </span>
                    </SelectItem>
                    {availableSuppliers.map((supplier) => (
                        <SelectItem
                            key={supplier.id}
                            value={supplier.id.toString()}
                        >
                            {supplier.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FormField>
    );
}
