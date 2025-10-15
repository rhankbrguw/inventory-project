import IndexPageLayout from "@/Components/IndexPageLayout";
import Pagination from "@/Components/Pagination";
import ProductCombobox from "@/Components/ProductCombobox";
import { Card, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { stockMovementColumns } from "@/Constants/tableColumns";
import DataTable from "@/Components/DataTable";

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

    return (
        <IndexPageLayout
            auth={auth}
            title="Riwayat Pergerakan Stok"
            headerActions={null}
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-6">
                        <Input
                            type="search"
                            placeholder="Cari nama atau SKU..."
                            value={params.search || ""}
                            onChange={(e) =>
                                setFilter("search", e.target.value)
                            }
                        />
                        <ProductCombobox
                            products={products.data}
                            value={params.product_id}
                            onChange={(product) =>
                                setFilter("product_id", product?.id)
                            }
                            placeholder="Semua Produk"
                        />
                        <Select
                            value={params.location_id || "all"}
                            onValueChange={(value) =>
                                setFilter("location_id", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Lokasi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Lokasi</SelectItem>
                                {locations.map((loc) => (
                                    <SelectItem
                                        key={loc.id}
                                        value={loc.id.toString()}
                                    >
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={params.type || "all"}
                            onValueChange={(value) => setFilter("type", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                {movementTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <DataTable
                    columns={stockMovementColumns}
                    data={stockMovements.data}
                    actions={null}
                    showRoute={null}
                />

                {stockMovements.data.length > 0 && (
                    <Pagination links={stockMovements.meta.links} />
                )}
            </div>
        </IndexPageLayout>
    );
}
