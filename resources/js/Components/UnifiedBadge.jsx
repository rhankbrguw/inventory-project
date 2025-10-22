import { generateHslColorFromString } from "@/lib/utils";

export default function UnifiedBadge({ text }) {
    if (!text) {
        return <span>-</span>;
    }

    const staticClassMap = {
        "Super Admin": "role-super-admin",
        "Warehouse Manager": "role-warehouse-manager",
        "Branch Manager": "role-branch-manager",
        Cashier: "role-cashier",
        Individu: "customer-type-individu",
        Cabang: "customer-type-cabang",
        Mitra: "customer-type-mitra",
    };

    const preDefinedClass = staticClassMap[text];
    const baseClasses =
        "px-3 py-1 text-xs font-semibold rounded-full inline-block";

    if (preDefinedClass) {
        return (
            <span className={`${baseClasses} ${preDefinedClass}`}>{text}</span>
        );
    }

    const dynamicStyle = generateHslColorFromString(text);
    return (
        <span className={baseClasses} style={dynamicStyle}>
            {text}
        </span>
    );
}
