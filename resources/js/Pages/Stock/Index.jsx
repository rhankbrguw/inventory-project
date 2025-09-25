import { useIndexPageFilters } from "@/Hooks/useIndexPageFilters";
import { stockColumns } from "@/Constants/tableColumns.jsx";
import IndexPageLayout from "@/Components/IndexPageLayout";
import DataTable from "@/Components/DataTable";
import MobileCardList from "@/Components/MobileCardList";
import StockMobileCard from "./Partials/StockMobileCard";
import Pagination from "@/Components/Pagination";
import { Card, CardContent } from "@/Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import { Package, Warehouse, Wrench } from "lucide-react";

const sortOptions = [
    { value: "name_asc", label: "Nama (A-Z)" },
    { value: "name_desc", label: "Nama (Z-A)" },
    { value: "quantity_desc", label: "Stok Terbanyak" },
    { value: "quantity_asc", label: "Stok Terdikit" },
    { value: "last_moved_desc", label: "Aktivitas Terbaru" },
    { value: "last_moved_asc", label: "Aktivitas Terlama" },
];

export default function Index({
    auth,
    inventories,
    locations = [],
    productTypes = [],
    filters = {},
}) {
    const { params, setFilter } = useIndexPageFilters("stock.index", filters);

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Stok"
            createRoute="stock.adjust.form"
            buttonLabel="Penyesuaian Stok"
            icon={Wrench}
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-6">
                        <Input
                            type="search"
                            placeholder="Cari nama atau sku..."
                            value={params.search || ""}
                            onChange={(e) =>
                                setFilter("search", e.target.value)
                            }
                            className="w-full sm:w-auto sm:flex-grow"
                        />
                        <Select
                            value={params.location_id || "all"}
                            onValueChange={(value) =>
                                setFilter("location_id", value)
                            }
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Semua Lokasi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Lokasi
                                </SelectItem>
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
                            value={params.type_id || "all"}
                            onValueChange={(value) =>
                                setFilter("type_id", value)
                            }
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Semua Tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                {productTypes.map((pType) => (
                                    <SelectItem
                                        key={pType.id}
                                        value={pType.id.toString()}
                                    >
                                        {pType.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={params.sort || "name_asc"}
                            onValueChange={(value) => setFilter("sort", value)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Urutkan" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <MobileCardList
                    data={inventories.data}
                    renderItem={(item) => (
                        <StockMobileCard key={item.id} item={item} />
                    )}
                />

                <div className="hidden md:block">
                    <DataTable columns={stockColumns} data={inventories.data} />
                </div>

                {inventories.data.length > 0 && (
                    <Pagination links={inventories.meta.links} />
                )}
            </div>
        </IndexPageLayout>
    );
}
