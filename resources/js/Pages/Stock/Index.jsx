import { Link, router } from "@inertiajs/react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Wrench, Eye, MoreVertical } from "lucide-react";

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
    products = [],
    filters = {},
}) {
    const { params, setFilter } = useIndexPageFilters("stock.index", filters);

    const renderActionDropdown = (item) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => router.get(route("stock.show", item.id))}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    Lihat
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

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
                    <CardContent className="flex flex-col md:flex-row md:items-center gap-2 pt-6">
                        <Input
                            type="search"
                            placeholder="Cari nama atau sku..."
                            value={params.search || ""}
                            onChange={(e) =>
                                setFilter("search", e.target.value)
                            }
                            className="w-full md:w-auto md:flex-grow"
                        />
                        <Select
                            value={params.product_id?.toString() || "all"}
                            onValueChange={(value) =>
                                setFilter(
                                    "product_id",
                                    value === "all" ? null : parseInt(value)
                                )
                            }
                        >
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Semua Produk" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Produk
                                </SelectItem>
                                {products.map((product) => (
                                    <SelectItem
                                        key={product.id}
                                        value={product.id.toString()}
                                    >
                                        {product.name} ({product.sku})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={params.location_id || "all"}
                            onValueChange={(value) =>
                                setFilter("location_id", value)
                            }
                        >
                            <SelectTrigger className="w-full md:w-[180px]">
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
                            value={params.sort || "name_asc"}
                            onValueChange={(value) => setFilter("sort", value)}
                        >
                            <SelectTrigger className="w-full md:w-[180px]">
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
                        <Link href={route("stock.show", item.id)} key={item.id}>
                            <StockMobileCard
                                item={item}
                                renderActionDropdown={renderActionDropdown}
                            />
                        </Link>
                    )}
                />

                <div className="hidden md:block">
                    <DataTable
                        columns={stockColumns}
                        data={inventories.data}
                        actions={renderActionDropdown}
                        showRoute="stock.show"
                        showRouteKey="id"
                    />
                </div>

                {inventories.data.length > 0 && (
                    <Pagination links={inventories.meta.links} />
                )}
            </div>
        </IndexPageLayout>
    );
}
