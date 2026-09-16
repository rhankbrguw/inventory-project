import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/useTranslation';
import { useProductSearch } from '@/hooks/useProductSearch';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import InputError from '@/components/InputError';

type ProductOption = {
    id: number | string;
    name: string;
    sku: string;
};

type ProductComboboxProps = {
    value?: number | string | null;
    onChange: (product: ProductOption) => void;
    error?: string | string[];
    disabledIds?: Array<number | string>;
    products?: ProductOption[];
    placeholder?: string;
    [key: string]: unknown;
};

export default function ProductCombobox({
    value,
    onChange,
    error,
    disabledIds = [],
    products: initialProducts = [],
    placeholder: _placeholder,
}: ProductComboboxProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery] = useDebounce(searchQuery, 300);
    const { options: fetchedOptions, loading } = useProductSearch(debouncedQuery, open);
    const [options, setOptions] = useState<ProductOption[]>(initialProducts);
    const { t } = useTranslation();

    useEffect(() => {
        if (fetchedOptions.length > 0) {
            setOptions(fetchedOptions);
        } else if (!debouncedQuery || debouncedQuery.length < 2) {
            setOptions(initialProducts);
        }
    }, [fetchedOptions, initialProducts, debouncedQuery]);

    const selectedProduct =
        options.find((p) => String(p.id) === String(value)) ||
        initialProducts.find((p) => String(p.id) === String(value));

    const label = selectedProduct
        ? `${selectedProduct.name} (${selectedProduct.sku})`
        : t('ui.select_product');
    const disabledIdSet = new Set(disabledIds.map((id) => String(id)));

    return (
        <div className="space-y-1">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between font-normal overflow-hidden"
                    >
                        <span className="truncate block flex-1 text-left min-w-0">
                            {label}
                        </span>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    side="bottom"
                    align="start"
                >
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={t('ui.search_name_sku')}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            {loading && (
                                <div className="py-6 flex justify-center items-center text-sm text-muted-foreground">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                    {t('ui.searching')}
                                </div>
                            )}

                            {!loading && options.length === 0 && (
                                <CommandEmpty>
                                    {t('ui.product_not_found')}
                                </CommandEmpty>
                            )}

                            <CommandGroup>
                                {!loading &&
                                    options.map((product) => (
                                        <CommandItem
                                            key={String(product.id)}
                                            value={String(product.id)}
                                            onSelect={() => {
                                                onChange(product);
                                                setOpen(false);
                                            }}
                                            disabled={
                                                disabledIdSet.has(String(product.id)) && String(product.id) !== String(value)
                                            }
                                            className="flex items-start cursor-pointer"
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4 shrink-0 mt-0.5',
                                                    String(value) === String(product.id)
                                                        ? 'opacity-100'
                                                        : 'opacity-0'
                                                )}
                                            />
                                            <div className="min-w-0 flex-1 overflow-hidden">
                                                <p className="truncate font-medium">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    SKU: {product.sku}
                                                </p>
                                            </div>
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <InputError message={error} />}
        </div>
    );
}
