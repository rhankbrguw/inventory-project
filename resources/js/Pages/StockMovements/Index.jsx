import IndexPageLayout from "@/Components/IndexPageLayout";
import Pagination from "@/Components/Pagination";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { stockMovementColumns } from "@/Constants/tableColumns.jsx";
import DataTable from "@/Components/DataTable";
import StockMovementFilterCard from "./Partials/StockMovementFilterCard";
import MobileCardList from "@/Components/MobileCardList";
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
        filters
    );

    const canCreateTransfer = ["Super Admin", "Warehouse Manager"].some(
        (role) => auth.user.roles.includes(role)
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
