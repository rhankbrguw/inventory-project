import { SellMobileCard } from './MobileCards/SellMobileCard';
import { PurchaseMobileCard } from './MobileCards/PurchaseMobileCard';
import { TransferMobileCard } from './MobileCards/TransferMobileCard';

type TransactionItemMobileCardProps = {
    item: Record<string, unknown>;
    type: 'sell' | 'purchase' | 'transfer' | string;
};

export default function TransactionItemMobileCard({ item, type }: TransactionItemMobileCardProps) {
    if (type === 'sell') return <SellMobileCard item={item as never} />;
    if (type === 'purchase') return <PurchaseMobileCard item={item as never} />;
    if (type === 'transfer') return <TransferMobileCard item={item as never} />;
    return null;
}
