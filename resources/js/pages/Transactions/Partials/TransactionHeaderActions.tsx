import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { Truck, ShoppingCart, ArrowRightLeft, Plus } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function TransactionHeaderActions({ can }) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
                {can.create_purchase && (
                    <Button
                        onClick={() =>
                            router.get(route('transactions.purchases.create'))
                        }
                        className="btn-purchase"
                    >
                        <Truck className="w-4 h-4 mr-2" />
                        {t('ui.create_purchase')}
                    </Button>
                )}
                {can.create_sell && (
                    <Button
                        onClick={() =>
                            router.get(route('transactions.sells.create'))
                        }
                        className="btn-sell"
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {t('ui.create_sell')}
                    </Button>
                )}
                {can.create_transfer && (
                    <Button
                        onClick={() =>
                            router.get(route('transactions.transfers.create'))
                        }
                        className="btn-transfer"
                    >
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        {t('ui.create_transfer')}
                    </Button>
                )}
            </div>

            <div className="sm:hidden">
                {(can.create_purchase ||
                    can.create_sell ||
                    can.create_transfer) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" className="rounded-full h-10 w-10">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {can.create_purchase && (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={() =>
                                        router.get(
                                            route('transactions.purchases.create')
                                        )
                                    }
                                >
                                    <Truck className="w-4 h-4 mr-2" />
                                    {t('ui.purchase')}
                                </DropdownMenuItem>
                            )}
                            {can.create_sell && (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={() =>
                                        router.get(
                                            route('transactions.sells.create')
                                        )
                                    }
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    {t('ui.sale')}
                                </DropdownMenuItem>
                            )}
                            {can.create_transfer && (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={() =>
                                        router.get(
                                            route('transactions.transfers.create')
                                        )
                                    }
                                >
                                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                                    {t('ui.create_transfer')}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}
