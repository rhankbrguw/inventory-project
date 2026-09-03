import type React from 'react';
import { Label } from '@/components/ui/label';

type FormFieldProps = {
    label?: React.ReactNode;
    htmlFor?: string;
    children: React.ReactNode;
    className?: string;
    error?: string | string[];
    optional?: boolean;
    description?: React.ReactNode;
    [key: string]: unknown;
};

export default function FormField({
    label,
    htmlFor,
    children,
    className = '',
    description,
}: FormFieldProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {children}
        </div>
    );
}
