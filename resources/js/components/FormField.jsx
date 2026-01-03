import { Label } from '@/components/ui/label';

export default function FormField({
    label,
    htmlFor,
    children,
    className = '',
}) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
        </div>
    );
}
