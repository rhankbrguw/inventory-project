import FormField from '@/components/FormField';
import { Button } from '@/components/ui/button';
import Checkbox from '@/components/Checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Check } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export function SupplierMultiSelect({ data, errors, suppliers, getSupplierDisplayText, handleSupplierToggle }) {
    const { t } = useTranslation();
    return (
        <FormField
            label={t('ui.supplier_multiple')}
            htmlFor="suppliers"
            error={errors.suppliers}
        >
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between font-normal"
                    >
                        {getSupplierDisplayText()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                >
                    <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
                        {suppliers.map((supplier) => (
                            <div
                                key={supplier.id}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    id={`supp-${supplier.id}`}
                                    checked={data.suppliers.includes(
                                        supplier.id
                                    )}
                                    onChange={() =>
                                        handleSupplierToggle(
                                            supplier.id
                                        )
                                    }
                                />
                                <label
                                    htmlFor={`supp-${supplier.id}`}
                                    className="text-sm cursor-pointer flex-1"
                                >
                                    {supplier.name}
                                </label>
                                {data.suppliers.includes(
                                    supplier.id
                                ) && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </FormField>
    );
}

export function DefaultSupplierSelect({ data, setData, errors, selectedSupplierObjects }) {
    const { t } = useTranslation();
    return (
        <FormField
            label={t('ui.default_supplier')}
            htmlFor="default_supplier_id"
            error={errors.default_supplier_id}
            description={t('ui.default_supplier_desc')}
        >
            <Select
                value={data.default_supplier_id?.toString() || ''}
                onValueChange={(value) =>
                    setData('default_supplier_id', value)
                }
                disabled={data.suppliers.length === 0}
            >
                <SelectTrigger>
                    <SelectValue placeholder={t('ui.select_default_supplier')} />
                </SelectTrigger>
                <SelectContent>
                    {selectedSupplierObjects.map((supplier) => (
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
