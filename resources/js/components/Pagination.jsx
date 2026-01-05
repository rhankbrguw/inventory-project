import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export default function Pagination({ links, className = '' }) {
    return (
        <nav className={cn('flex items-center justify-center', className)}>
            {links.map((link, index) => {
                const isPlaceholder = !link.url;
                const isActive = link.active;

                return (
                    <Link
                        key={index}
                        href={link.url || '#'}
                        preserveScroll
                        className={cn(
                            'mx-1 px-4 py-2 text-sm rounded-md transition-colors border shadow-sm',
                            {
                                'bg-primary text-primary-foreground': isActive,
                                'bg-card text-foreground hover:bg-accent':
                                    !isActive && !isPlaceholder,
                                'bg-muted text-muted-foreground cursor-not-allowed':
                                    isPlaceholder,
                            }
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </nav>
    );
}
