const STATIC_CLASS_MAP: Record<string, string> = {
    Adm: 'role-super-admin',
    Whm: 'role-warehouse-manager',
    Brm: 'role-branch-manager',
    Csh: 'role-cashier',
    Stf: 'role-warehouse-manager',

    'Super admin': 'role-super-admin',
    'Warehouse manager': 'role-warehouse-manager',
    'Branch manager': 'role-branch-manager',
    Cashier: 'role-cashier',
    Staff: 'role-warehouse-manager',

    Ind: 'customer-type-individu',
    Cbg: 'customer-type-cabang',
    Mtr: 'customer-type-mitra',

    Pembelian: 'transaction-type-pembelian',
    Purchase: 'transaction-type-pembelian',
    Purchases: 'transaction-type-pembelian',
    Penjualan: 'transaction-type-penjualan',
    Sell: 'transaction-type-penjualan',
    Sales: 'transaction-type-penjualan',
    Transfer: 'transaction-type-transfer',
    'Stock transfer': 'transaction-type-transfer',
    Penyesuaian: 'transaction-type-adjustment',
    Adjustment: 'transaction-type-adjustment',

    'Pending approval': 'status-pending-approval',
    Approved: 'status-approved',
    'On process': 'status-on-process',
    Shipping: 'status-shipping',
    Completed: 'status-completed',
    Rejected: 'status-rejected',

    Cash: 'channel-cash',
    Counter: 'channel-cash',
    Gofood: 'channel-gofood',
    Grabfood: 'channel-grabfood',
    Shopeefood: 'channel-shopeefood',
    Tiktokshop: 'channel-tiktokshop',
};

const DYNAMIC_PALETTES = [
    'bg-sky/15 text-sky border-sky/25',
    'bg-emerald/15 text-emerald border-emerald/25',
    'bg-orange/15 text-orange border-orange/25',
    'bg-purple/15 text-purple border-purple/25',
    'bg-highlight/15 text-highlight border-highlight/25',
    'bg-info/15 text-info border-info/25',
    'bg-success/15 text-success border-success/25',
    'bg-amber/15 text-amber border-amber/25',
];

function getDynamicColorClass(input: string): string {
    if (!input) return DYNAMIC_PALETTES[0];

    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = input.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % DYNAMIC_PALETTES.length;
    return DYNAMIC_PALETTES[index];
}

export type UnifiedBadgeProps = {
    text?: string | number | null;
    code?: string | number | null;
    level?: string | number | null;
    className?: string;
    [key: string]: unknown;
};

export default function UnifiedBadge({ text, code, className = '' }: UnifiedBadgeProps) {
    if (!text && !code) return <span>-</span>;

    const displayText = String(text ?? code ?? '').trim();

    const normalizeString = (str: string | number | null | undefined): string | null => {
        if (str === null || str === undefined || str === '') return null;

        const value = String(str).trim();
        if (!value) return null;

        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    };

    const normalizedText = normalizeString(text ?? code);
    const normalizedCode = normalizeString(code);
    const staticClass =
        (normalizedCode && STATIC_CLASS_MAP[normalizedCode]) ||
        (normalizedText && STATIC_CLASS_MAP[normalizedText]);
    const badgeClass = staticClass || getDynamicColorClass(displayText);

    return (
        <span className={`badge-base ${badgeClass} ${className}`.trim()}>
            {displayText}
        </span>
    );
}
