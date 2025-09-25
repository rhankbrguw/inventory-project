import { Label } from "@/Components/ui/label";
import InputError from "@/Components/InputError";

export default function FormField({
    label,
    htmlFor,
    error,
    children,
    className = "",
}) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
