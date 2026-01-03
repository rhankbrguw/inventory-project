import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import InputError from '@/components/InputError';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import axios from 'axios';
import { cn } from '@/lib/utils';

export default function ProductCombobox({
    value,
    onChange,
    error,
    disabledIds = [],
    products: initialProducts = [],
}) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery] = useDebounce(searchQuery, 300);
    const [options, setOptions] = useState(initialProducts);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setOptions(initialProducts);
    }, [initialProducts]);

    const selectedProduct =
        options.find((p) => p.id === value) ||
        initialProducts.find((p) => p.id === value);

    const label = selectedProduct
        ? `${selectedProduct.name} (${selectedProduct.sku})`
        : 'Pilih produk...';

    useEffect(() => {
        if (!open) return;
        if (debouncedQuery.length < 2) return;

        setLoading(true);
        axios
            .get(`/api/products/search?query=${debouncedQuery}`)
            .then((res) => {
                setOptions(res.data);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [debouncedQuery, open]);

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
                            placeholder="Cari nama atau SKU..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            {loading && (
                                <div className="py-6 flex justify-center items-center text-sm text-muted-foreground">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                    Mencari...
                                </div>
                            )}

                            {!loading && options.length === 0 && (
                                <CommandEmpty>
                                    Produk tidak ditemukan.
                                </CommandEmpty>
                            )}

                            <CommandGroup>
                                {!loading &&
                                    options.map((product) => (
                                        <CommandItem
                                            key={product.id}
                                            value={product.id.toString()}
                                            onSelect={() => {
                                                onChange(product);
                                                setOpen(false);
                                            }}
                                            disabled={
                                                disabledIds.includes(
                                                    product.id
                                                ) && product.id !== value
                                            }
                                            className="flex items-start cursor-pointer"
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4 shrink-0 mt-0.5',
                                                    value === product.id
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
