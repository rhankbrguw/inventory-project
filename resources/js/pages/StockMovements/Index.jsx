import IndexPageLayout from "@/components/IndexPageLayout";
import Pagination from "@/components/Pagination";
import { useIndexPageFilters } from "@/hooks/useIndexPageFilters";
import { stockMovementColumns } from "@/constants/tableColumns.jsx";
import DataTable from "@/components/DataTable";
import StockMovementFilterCard from "./Partials/StockMovementFilterCard";
import MobileCardList from "@/components/MobileCardList";
import StockMovementMobileCard from "./Partials/StockMovementMobileCard";
import { ArrowRightLeft } from "lucide-react";

export default function Index({
    auth,
    stockMovements,
    locations,
    products,
    movementTypes,
    filters,
}) {
    const { params, setFilter } = useIndexPageFilters(
        "stock-movements.index",
        filters,
    );

    return (
        <IndexPageLayout auth={auth} title="Riwayat Stok" icon={ArrowRightLeft}>
            <div className="space-y-4">
                <StockMovementFilterCard
                    params={params}
                    setFilter={setFilter}
                    products={products}
                    locations={locations}
                    movementTypes={movementTypes}
                />

                <MobileCardList
                    data={stockMovements.data}
                    renderItem={(movement) => (
                        <StockMovementMobileCard
                            key={movement.id}
                            movement={movement}
                        />
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={stockMovementColumns}
                        data={stockMovements.data}
                        actions={null}
                        showRoute={null}
                    />
                </div>

                {stockMovements.data.length > 0 && (
                    <Pagination links={stockMovements.meta.links} />
                )}
            </div>
        </IndexPageLayout>
    );
}
