import IndexPageLayout from "@/Components/IndexPageLayout";
import { router } from "@inertiajs/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import Pagination from "@/Components/Pagination";
import { Button } from "@/Components/ui/button";
import { Package, Warehouse, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const TABLE_COLUMNS = [
    {
        key: "product_name",
        label: "Nama Item",
        align: "center",
        className: "font-medium",
    },
    { key: "location_name", label: "Lokasi", align: "center" },
    { key: "quantity", label: "Kuantitas", align: "center" },
];

const sortOptions = [
    { value: "name_asc", label: "Nama (A-Z)" },
    { value: "name_desc", label: "Nama (Z-A)" },
    { value: "quantity_desc", label: "Stok Terbanyak" },
    { value: "quantity_asc", label: "Stok Terdikit" },
];

const getAlignmentClass = (align) => {
    const alignmentMap = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    };
    return alignmentMap[align] || "text-left";
};

export default function Index({
    auth,
    inventories = { data: [], meta: { links: [] } },
    locations = [],
    productTypes = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || "");
    const [location, setLocation] = useState(filters.location_id || "all");
    const [type, setType] = useState(filters.type_id || "all");
    const [sort, setSort] = useState(filters.sort || "name_asc");

    const applyFilters = () => {
        const params = {
            search: search || undefined,
            location_id: location === "all" ? undefined : location,
            type_id: type === "all" ? undefined : type,
            sort: sort,
        };
        router.get(route("stock.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const renderLocationIcon = (locType) => {
        if (locType === "warehouse") {
            return <Warehouse className="w-4 h-4 mr-2 text-muted-foreground" />;
        }
        return <Package className="w-4 h-4 mr-2 text-muted-foreground" />;
    };

    const renderCellContent = (column, item) => {
        switch (column.key) {
            case "product_name":
                return item.product.name;
            case "location_name":
                return (
                    <div className="flex items-center justify-center">
                        {renderLocationIcon(item.location.type)}
                        {item.location.name}
                    </div>
                );
            case "quantity":
                return (
                    <>
                        <span className="font-semibold">
                            {parseFloat(item.quantity).toLocaleString("id-ID")}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                            {item.product.unit}
                        </span>
                    </>
                );
            default:
                return "";
        }
    };

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Stok"
            buttonLabel="Input Stok Masuk"
            createRoute="stock.adjust.form"
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Filter & Urutkan Stok</CardTitle>
                        <Button
                            onClick={applyFilters}
                            className="w-auto hidden sm:flex"
                        >
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Terapkan
                        </Button>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-2">
                        <Input
                            type="search"
                            placeholder="Cari produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-auto sm:flex-grow"
                        />
                        <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger className="w-full sm:w-[180px]">
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
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-full sm:w-[180px]">
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
                        <Select value={sort} onValueChange={setSort}>
                            <SelectTrigger className="w-full sm:w-[180px]">
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
                        <Button
                            onClick={applyFilters}
                            className="w-full sm:hidden"
                        >
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Terapkan
                        </Button>
                    </CardContent>
                </Card>

                <div className="md:hidden space-y-4">
                    {inventories.data.map((item) => (
                        <Card key={item.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {item.product.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    {renderLocationIcon(item.location.type)}
                                    {item.location.name}
                                </div>
                                <div className="text-lg font-bold mt-2">
                                    {parseFloat(item.quantity).toLocaleString(
                                        "id-ID"
                                    )}
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        {item.product.unit}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="hidden md:block bg-card text-card-foreground shadow-sm sm:rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {TABLE_COLUMNS.map((col) => (
                                    <TableHead
                                        key={col.key}
                                        className={getAlignmentClass(col.align)}
                                    >
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventories.data.map((item) => (
                                <TableRow key={item.id}>
                                    {TABLE_COLUMNS.map((col) => (
                                        <TableCell
                                            key={col.key}
                                            className={`${getAlignmentClass(
                                                col.align
                                            )} ${col.className || ""}`}
                                        >
                                            {renderCellContent(col, item)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {inventories.data.length > 0 && (
                    <Pagination links={inventories.meta.links} />
                )}
            </div>
        </IndexPageLayout>
    );
}
