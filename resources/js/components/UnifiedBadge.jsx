import { generateHslColorFromString } from '@/lib/utils';

export default function UnifiedBadge({ text, code }) {
    if (!text) return <span>-</span>;

    const normalizeString = (str) => {
        if (!str) return null;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const normalizedText = normalizeString(text);
    const normalizedCode = normalizeString(code);

    const staticClassMap = {
        Adm: 'role-super-admin',
        Whm: 'role-warehouse-manager',
        Brm: 'role-branch-manager',
        Csh: 'role-cashier',

        'Super admin': 'role-super-admin',
        'Warehouse manager': 'role-warehouse-manager',
        'Branch manager': 'role-branch-manager',

        Cashier: 'role-cashier',
        Ind: 'customer-type-individu',
        Cbg: 'customer-type-cabang',
        Mtr: 'customer-type-mitra',
        Pembelian: 'transaction-type-pembelian',
        Penjualan: 'transaction-type-penjualan',
        Transfer: 'transaction-type-transfer',

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

    const preDefinedClass =
        staticClassMap[normalizedCode] || staticClassMap[normalizedText];

    if (preDefinedClass) {
        return <span className={`badge-base ${preDefinedClass}`}>{text}</span>;
    }

    const dynamicStyle = generateHslColorFromString(text);
    return (
        <span className="badge-base" style={dynamicStyle}>
            {text}
        </span>
    );
}
