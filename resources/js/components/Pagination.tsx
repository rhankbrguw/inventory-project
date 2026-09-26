import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginationMeta = {
    total?: number;
    from?: number;
    to?: number;
};

type PaginationProps = {
    links?: PaginationLink[];
    meta?: PaginationMeta;
    className?: string;
};

export default function Pagination({ links, meta, className = '' }: PaginationProps) {
    const { t } = useTranslation();

    const hasNav = Boolean(links && links.length > 3);
    const hasMeta = Boolean(meta && meta.total && meta.total > 0);

    if (!hasNav && !hasMeta) return null;

    const renderLabel = (label: string) => {
        if (label.includes('Previous') || label.includes('&laquo;') || label.includes('pagination.previous')) {
            return (
                <span className="flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs">{t('ui.previous')}</span>
                </span>
            );
        }
        if (label.includes('Next') || label.includes('&raquo;') || label.includes('pagination.next')) {
            return (
                <span className="flex items-center gap-1">
                    <span className="hidden sm:inline text-xs">{t('ui.next')}</span>
                    <ChevronRight className="w-4 h-4" />
                </span>
            );
        }
        return label;
    };

    return (
        <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2', className)}>
            {hasMeta ? (
                <p className="text-xs text-muted-foreground order-2 sm:order-1">
                    {t('ui.showing')} <span className="font-semibold text-foreground">{meta!.from || 0}</span> - <span className="font-semibold text-foreground">{meta!.to || 0}</span> {t('ui.of')} <span className="font-semibold text-foreground">{meta!.total}</span> {t('ui.items')}
                </p>
            ) : <div className="hidden sm:block order-1" />}

            {hasNav && links && (
                <nav aria-label="Pagination" className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                    {links.map((link, idx) => {
                    const isPlaceholder = !link.url;
                    const isActive = link.active;
                    const baseClasses = 'h-8 min-w-[32px] px-2.5 flex items-center justify-center text-xs font-medium rounded-lg transition-all duration-200 select-none';

                    if (isPlaceholder) {
                        return (
                            <span
                                key={idx}
                                aria-disabled="true"
                                className={cn(baseClasses, 'text-muted-foreground/40 border border-transparent cursor-not-allowed pointer-events-none')}
                            >
                                {renderLabel(link.label)}
                            </span>
                        );
                    }

                    const href = link.url ?? '#';

                    return (
                        <Link
                            key={idx}
                            href={href}
                            preserveScroll
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                baseClasses,
                                'border',
                                isActive
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold'
                                    : 'bg-card border-border/60 text-foreground hover:bg-accent hover:border-border active:scale-95'
                            )}
                        >
                            {renderLabel(link.label)}
                        </Link>
                    );
                })}
            </nav>
            )}
        </div>
    );
}
