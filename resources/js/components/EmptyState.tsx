import type React from 'react';

type EmptyStateProps = {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
};

export default function EmptyState({
    icon: Icon,
    title,
    description,
}: EmptyStateProps) {
    return (
        <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-muted-foreground">
            <div className="p-3 bg-muted/30 rounded-full mb-3">
                <Icon className="h-6 w-6 opacity-40" />
            </div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
    );
}
