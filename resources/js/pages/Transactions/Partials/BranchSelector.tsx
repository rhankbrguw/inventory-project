import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
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
import useTranslation from '@/hooks/useTranslation';

export default function BranchSelector({
    branchOpen,
    setBranchOpen,
    selectedBranchId,
    branches,
    onBranchChange,
}) {
    const { t } = useTranslation();

    return (
        <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
                {t('ui.select_dest_branch')}
            </Label>
            <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={branchOpen}
                        className="w-full justify-between h-9 text-xs"
                    >
                        {selectedBranchId
                            ? branches.find((b) => b.id.toString() === selectedBranchId)?.name
                            : t('ui.search_branch')}
                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder={t('ui.search_branch')} className="h-9 text-xs" />
                        <CommandList>
                            <CommandEmpty>{t('ui.branch_not_found')}</CommandEmpty>
                            <CommandGroup>
                                {branches.map((branch) => (
                                    <CommandItem
                                        key={branch.id}
                                        value={branch.name}
                                        onSelect={() => {
                                            onBranchChange(branch.id.toString());
                                            setBranchOpen(false);
                                        }}
                                        className="text-xs"
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-3 w-3',
                                                selectedBranchId === branch.id.toString() ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        {branch.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
