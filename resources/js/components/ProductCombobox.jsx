import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import InputError from "@/components/InputError";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductCombobox({
    products,
    value,
    onChange,
    error,
    disabledIds = [],
}) {
    const [open, setOpen] = useState(false);
    const selectedProduct = products.find((p) => p.id === value);

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
                            {selectedProduct
                                ? `${selectedProduct.name} (${selectedProduct.sku})`
                                : "Pilih produk..."}
                        </span>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    side="bottom"
                    align="start"
                >
                    <Command>
                        <CommandInput placeholder="Cari produk atau SKU..." />
                        <CommandList>
                            <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                                {products.map((product) => (
                                    <CommandItem
                                        key={product.id}
                                        value={`${product.name} ${product.sku}`}
                                        onSelect={() => {
                                            onChange(product);
                                            setOpen(false);
                                        }}
                                        disabled={
                                            disabledIds.includes(product.id) &&
                                            product.id !== value
                                        }
                                        className="flex items-start"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 shrink-0 mt-0.5",
                                                value === product.id
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                            <p className="truncate">
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
