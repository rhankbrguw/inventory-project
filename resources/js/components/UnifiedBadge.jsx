import { generateHslColorFromString } from "@/lib/utils";

export default function UnifiedBadge({ text, code }) {

    if (!text) {
        return <span>-</span>;
    }

    const staticClassMap = {
        "ADM": "role-super-admin",
        "WHM": "role-warehouse-manager",
        "BRM": "role-branch-manager",
        "CSH": "role-cashier",

        "IND": "customer-type-individu",
        "CBG": "customer-type-cabang",
        "MTR": "customer-type-mitra",

        "Super Admin": "role-super-admin",
        "Warehouse Manager": "role-warehouse-manager",
    };

    const preDefinedClass = staticClassMap[code] || staticClassMap[text];

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
