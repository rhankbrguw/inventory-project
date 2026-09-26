import { Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function NotFound() {
    const { t } = useTranslation();

    const title = t('ui.page_not_found') === 'ui.page_not_found'
        ? 'Halaman Tidak Ditemukan'
        : t('ui.page_not_found');

    const desc = t('ui.page_not_found_desc') === 'ui.page_not_found_desc'
        ? 'Halaman yang Anda cari tidak tersedia, telah dipindahkan, atau tautan yang dimasukkan salah.'
        : t('ui.page_not_found_desc');

    const goBackText = t('ui.go_back') === 'ui.go_back'
        ? 'Kembali'
        : t('ui.go_back');

    const dashboardText = t('ui.back_to_dashboard') === 'ui.back_to_dashboard'
        ? 'Kembali ke Dashboard'
        : t('ui.back_to_dashboard');

    const handleGoBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/dashboard';
        }
    };

    return (
        <>
            <Head title={title} />
            <main className="min-h-screen w-full flex items-center justify-center bg-background px-6 py-16 selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
                <div className="w-full max-w-lg mx-auto text-center space-y-8 relative z-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-muted/80 text-muted-foreground border border-border">
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                            <span>HTTP 404</span>
                        </div>

                        <h1 className="text-7xl sm:text-9xl font-black tracking-tighter text-foreground/90 select-none">
                            404
                        </h1>

                        <div className="space-y-2 max-w-md mx-auto">
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                {title}
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {desc}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={handleGoBack}
                            className="w-full sm:w-auto h-10 px-5 gap-2 text-xs font-medium border-border hover:bg-muted/80 transition-colors shadow-xs"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>{goBackText}</span>
                        </Button>
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto h-10 px-5 gap-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs">
                                <Home className="w-4 h-4" />
                                <span>{dashboardText}</span>
                                <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-12 border-t border-border/40">
                        <p className="text-[11px] font-mono text-muted-foreground/60 tracking-wider uppercase">
                            Enterprise Cloud Platform
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
