import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import PurchaseCart from './PurchaseCart';
import { formatNumber } from '@/lib/utils';

export default function PurchaseCartSheet({
    cartOpen,
    setCartOpen,
    totalCartItems,
    cartProps,
}) {
    return (
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
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
                <PurchaseCart
                    {...cartProps}
                    onClose={() => setCartOpen(false)}
                />
            </SheetContent>
        </Sheet>
    );
}
