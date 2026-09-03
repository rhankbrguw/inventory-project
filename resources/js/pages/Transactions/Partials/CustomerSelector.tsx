import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserPlus, Check, ChevronsUpDown } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import QuickAddCustomerModal from '@/components/QuickAddCustomerModal';
import useTranslation from '@/hooks/useTranslation';

export default function CustomerSelector({
    customerOpen,
    setCustomerOpen,
    selectedCustomerId,
    customers,
    customerTypes,
    handleNewCustomer,
    onCustomerChange,
}) {
    const { t } = useTranslation();

    return (
        <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
                {t('ui.select_registered_customer')}
            </Label>
            <div className="flex gap-2">
                <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={customerOpen}
                            className="w-full justify-between h-9 text-xs"
                        >
                            {selectedCustomerId
                                ? customers.find((c) => c.id.toString() === selectedCustomerId)?.name
                                : t('ui.search_customer')}
                            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                        <Command>
                            <CommandInput placeholder={t('ui.search_customer')} className="h-9 text-xs" />
                            <CommandList>
                                <CommandEmpty>{t('ui.customer_not_found')}</CommandEmpty>
                                <CommandGroup>
                                    {customers.map((customer) => (
                                        <CommandItem
                                            key={customer.id}
                                            value={customer.name}
                                            onSelect={() => {
                                                onCustomerChange(customer.id.toString());
                                                setCustomerOpen(false);
                                            }}
                                            className="text-xs"
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-3 w-3',
                                                    selectedCustomerId === customer.id.toString() ? 'opacity-100' : 'opacity-0'
                                                )}
                                            />
                                            {customer.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                <QuickAddCustomerModal customerTypes={customerTypes} onSuccess={handleNewCustomer}>
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
                        <UserPlus className="h-4 w-4" />
                    </Button>
                </QuickAddCustomerModal>
            </div>
        </div>
    );
}
