import IndexPageLayout from '@/components/IndexPageLayout';
import ReportContent from './Partials/ReportContent';
import ReportFilterCard from './Partials/ReportFilterCard';
import { BarChart3 } from 'lucide-react';

export default function ReportsIndex({
    auth,
    stats,
    charts,
    locations,
    products,
    filters,
}) {
    return (
        <IndexPageLayout
            auth={auth}
            title="Laporan"
            description={`Analisis penjualan ${filters.resolved_label}`}
            icon={BarChart3}
            headerActions={
                <div className="hidden sm:flex">
                    <ReportFilterCard
                        auth={auth}
                        locations={locations}
                        products={products}
                        filters={filters}
                    />
                </div>
            }
        >
            <div className="flex sm:hidden mb-4">
                <ReportFilterCard
                    auth={auth}
                    locations={locations}
                    products={products}
                    filters={filters}
                />
            </div>
            <ReportContent stats={stats} charts={charts} />
        </IndexPageLayout>
    );
}
