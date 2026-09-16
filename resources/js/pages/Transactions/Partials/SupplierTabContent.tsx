import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserPlus, Check, ChevronsUpDown } from 'lucide-react';
import QuickAddSupplierModal from '@/components/QuickAddSupplierModal';
import { TabsContent } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

export default function SupplierTabContent({ supplierOpen, setSupplierOpen, getSupplierLabel, suppliers, selectedSourceId, setFilter, onInternalSourceChange }) {
    const { t } = useTranslation();

    const handleSelect = (idStr) => {
        setFilter('supplier_id', idStr);
        onInternalSourceChange(idStr, 'supplier');
        setSupplierOpen(false);
    };

    const options = [
        { id: 'all', label: t('ui.all_suppliers') },
        { id: 'null', label: t('ui.general_supplier') },
        ...suppliers.map((s) => ({ id: s.id.toString(), label: s.name })),
    ];

    return (
        <TabsContent value="supplier" className="mt-0 space-y-2">
            <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">{t('ui.product_filter')}</Label>
                    <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={supplierOpen} className="w-full justify-between h-9 text-xs">
                                {getSupplierLabel()}<ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder={t('ui.search_supplier')} className="h-9 text-xs" />
                                <CommandList>
                                    <CommandEmpty>{t('ui.supplier_not_found')}</CommandEmpty>
                                    <CommandGroup>
                                        {options.map((opt) => (
                                            <CommandItem key={opt.id} value={opt.label} onSelect={() => handleSelect(opt.id)} className="text-xs">
                                                <Check className={cn('mr-2 h-3 w-3', selectedSourceId === opt.id ? 'opacity-100' : 'opacity-0')} />{opt.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                <QuickAddSupplierModal onSuccess={(newSup) => handleSelect(newSup.id.toString())}>
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9 flex-shrink-0"><UserPlus className="h-4 w-4" /></Button>
                </QuickAddSupplierModal>
            </div>
        </TabsContent>
    );
}
