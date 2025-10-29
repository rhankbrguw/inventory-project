import IndexPageLayout from "@/components/IndexPageLayout";
import Pagination from "@/components/Pagination";
import { useIndexPageFilters } from "@/hooks/useIndexPageFilters";
import { stockMovementColumns } from "@/constants/tableColumns.jsx";
import DataTable from "@/components/DataTable";
import StockMovementFilterCard from "./Partials/StockMovementFilterCard";
import MobileCardList from "@/components/MobileCardList";
import StockMovementMobileCard from "./Partials/StockMovementMobileCard";
import { Send } from "lucide-react";

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

    const canCreateTransfer = ["Super Admin", "Warehouse Manager"].some(
        (role) => auth.user.roles.includes(role),
    );

    return (
        <IndexPageLayout
            auth={auth}
            title="Riwayat Stok"
            createRoute={
                canCreateTransfer ? "stock-movements.transfers.create" : null
            }
            buttonLabel="Buat Transfer Baru"
            icon={Send}
        >
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
