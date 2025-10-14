import { Badge } from "@/Components/ui/badge";

export default function CustomerTypeBadge({ type }) {
    if (!type) return null;

    const typeClassMap = {
        Individu: "customer-type-individu",
        Cabang: "customer-type-cabang",
        Mitra: "customer-type-mitra",
    };

    return (
        <Badge
            className={`whitespace-nowrap ${
                typeClassMap[type.name] || "bg-muted text-muted-foreground"
            }`}
        >
            {type.name}
        </Badge>
    );
}
