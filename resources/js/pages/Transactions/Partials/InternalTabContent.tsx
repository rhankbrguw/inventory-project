import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';

export default function InternalTabContent({
    warehouseOpen,
    setWarehouseOpen,
    getWarehouseLabel,
    warehouses,
    selectedSourceId,
    restrictedWarehouseIds,
    onInternalSourceChange,
}) {
    const { t } = useTranslation();

    return (
        <TabsContent value="internal" className="mt-0 space-y-2">
            <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                    {t('ui.select_source_warehouse')}
                </Label>
                <Popover
                    open={warehouseOpen}
                    onOpenChange={setWarehouseOpen}
                >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={warehouseOpen}
                            className="w-full justify-between h-9 text-xs"
                        >
                            {getWarehouseLabel()}
                            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-[280px] p-0"
                        align="start"
                    >
                        <Command>
                            <CommandInput
                                placeholder={t('ui.search_warehouse')}
                                className="h-9 text-xs"
                            />
                            <CommandList>
                                <CommandEmpty>
                                    {t('ui.warehouse_not_found')}
                                </CommandEmpty>
                                <CommandGroup>
                                    {warehouses.map((warehouse) => {
                                        const isDisabled =
                                            restrictedWarehouseIds.includes(
                                                warehouse.id.toString()
                                            );
                                        return (
                                            <CommandItem
                                                key={warehouse.id}
                                                value={warehouse.name}
                                                disabled={isDisabled}
                                                onSelect={() => {
                                                    if (isDisabled) {
                                                        return;
                                                    }
                                                    onInternalSourceChange(
                                                        warehouse.id.toString(),
                                                        'internal'
                                                    );
                                                    setWarehouseOpen(false);
                                                }}
                                                className={cn(
                                                    'text-xs',
                                                    isDisabled &&
                                                        'opacity-50 cursor-not-allowed'
                                                )}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-3 w-3',
                                                        selectedSourceId ===
                                                            warehouse.id.toString()
                                                            ? 'opacity-100'
                                                            : 'opacity-0'
                                                    )}
                                                />
                                                {warehouse.name}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </TabsContent>
    );
}
