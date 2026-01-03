import { generateHslColorFromString } from "@/lib/utils";

export default function UnifiedBadge({ text, code }) {
    if (!text) return <span>-</span>;

    const staticClassMap = {
        ADM: "role-super-admin",
        WHM: "role-warehouse-manager",
        BRM: "role-branch-manager",
        CSH: "role-cashier",

        IND: "customer-type-individu",
        CBG: "customer-type-cabang",
        MTR: "customer-type-mitra",

        Pembelian: "transaction-type-pembelian",
        Penjualan: "transaction-type-penjualan",
        Transfer: "transaction-type-transfer",

        "Super Admin": "role-super-admin",
        "Warehouse Manager": "role-warehouse-manager",
        "Branch Manager": "role-branch-manager",
        Cashier: "role-cashier",
    };

    const preDefinedClass = staticClassMap[code] || staticClassMap[text];

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
