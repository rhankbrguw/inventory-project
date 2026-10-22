import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import SellCart from './SellCart';

export default function SellCartSheet({
    isOpen,
    onOpenChange,
    totalCartItems,
    cartProps,
}) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button
                    className="lg:hidden fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50"
                    size="icon"
                >
                    <ShoppingCart className="h-6 w-6" />
                    {totalCartItems > 0 && (
                        <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                            {formatNumber(totalCartItems)}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md p-0 flex flex-col"
            >
                <SellCart {...cartProps} />
            </SheetContent>
        </Sheet>
    );
}
