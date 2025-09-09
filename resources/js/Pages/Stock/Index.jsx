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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import Pagination from "@/Components/Pagination";
import { SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

const TABLE_COLUMNS = [
    {
        key: "name",
        label: "Nama Item",
        align: "center",
        className: "font-medium",
    },
    {
        key: "sku",
        label: "SKU",
        align: "center",
    },
    {
        key: "total_stock",
        label: "Total Stok",
        align: "center",
    },
    {
        key: "locations",
        label: "Rincian per Lokasi",
        align: "center",
    },
];

const getAlignmentClass = (align) => {
    const alignmentMap = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    };
    return alignmentMap[align] || "text-left";
};

const StockList = ({ items }) => {
    const renderLocationDetails = (inventories, unit) => {
        if (inventories.length === 0) {
            return (
                <span className="text-muted-foreground text-sm italic">
                    Tidak ada stok tercatat
                </span>
            );
        }

        return (
            <ul className="list-disc list-inside space-y-1">
                {inventories.map((inv) => (
                    <li key={inv.location.id} className="text-sm">
                        {inv.location.name}:{" "}
                        <span className="font-semibold">
                            {inv.quantity} {unit}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    const renderTotalStock = (totalStock, unit) => (
        <>
            <span className="font-medium">{totalStock}</span>
            <span className="text-muted-foreground text-sm"> {unit}</span>
        </>
    );

    const renderCellContent = (column, product, totalStock) => {
        switch (column.key) {
            case "name":
                return product.name;
            case "sku":
                return product.sku;
            case "total_stock":
                return renderTotalStock(totalStock, product.unit);
            case "locations":
                return renderLocationDetails(product.inventories, product.unit);
            default:
                return "";
        }
    };

    return (
        <Card>
            <CardContent className="p-0">
                <div className="md:hidden space-y-4 p-4">
                    {items.data.map((product) => {
                        const totalStock = product.inventories.reduce(
                            (sum, inv) => sum + inv.quantity,
                            0
                        );
                        return (
                            <Card
                                key={product.id}
                                className="shadow-none border"
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {product.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground">
                                        SKU: {product.sku}
                                    </div>
                                    <div className="text-lg font-bold">
                                        {totalStock} {product.unit}
                                    </div>
                                    <ul className="mt-2 space-y-1">
                                        {product.inventories.map((inv) => (
                                            <li
                                                key={inv.location.id}
                                                className="text-xs text-muted-foreground"
                                            >
                                                {inv.location.name}:{" "}
                                                <span className="font-semibold">
                                                    {inv.quantity}{" "}
                                                    {product.unit}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {TABLE_COLUMNS.map((column) => (
                                    <TableHead
                                        key={column.key}
                                        className={getAlignmentClass(
                                            column.align
                                        )}
                                    >
                                        {column.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.data.map((product) => {
                                const totalStock = product.inventories.reduce(
                                    (sum, inv) => sum + inv.quantity,
                                    0
                                );
                                return (
                                    <TableRow key={product.id}>
                                        {TABLE_COLUMNS.map((column) => (
                                            <TableCell
                                                key={column.key}
                                                className={`${getAlignmentClass(
                                                    column.align
                                                )} ${column.className || ""}`}
                                            >
                                                {renderCellContent(
                                                    column,
                                                    product,
                                                    totalStock
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <Pagination links={items.meta.links} className="p-4" />
        </Card>
    );
};

export default function Index({
    auth,
    rawMaterials,
    finishedGoods,
    locations,
    filters,
}) {
    const [search, setSearch] = useState(filters.search || "");
    const [location, setLocation] = useState(filters.location_id || "all");

    useEffect(() => {
        const handler = setTimeout(() => {
            const currentParams = route().params;
            const params = {
                ...currentParams,
                search: search || undefined,
                location_id: location === "all" ? undefined : location,
            };
            router.get(route("stock.index"), params, {
                preserveState: true,
                replace: true,
            });
        }, 500);
        return () => clearTimeout(handler);
    }, [search, location]);

    const activeTab = route().params.tab || "raw_materials";

    return (
        <IndexPageLayout
            auth={auth}
            title="Manajemen Stok"
            createRoute="stock.adjust.form"
            buttonLabel="Penyesuaian Stok"
            icon={SlidersHorizontal}
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Data Stok</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Input
                                type="search"
                                placeholder="Cari nama atau SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:max-w-sm"
                            />
                            <Select
                                value={location}
                                onValueChange={(value) => setLocation(value)}
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
                        </div>
                    </CardContent>
                </Card>

                <Tabs
                    defaultValue={activeTab}
                    onValueChange={(tab) =>
                        router.get(
                            route("stock.index"),
                            { ...route().params, tab },
                            { preserveState: true, replace: true }
                        )
                    }
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="raw_materials">
                            Stok Bahan Baku
                        </TabsTrigger>
                        <TabsTrigger value="finished_goods">
                            Stok Menu Jadi
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="raw_materials" className="mt-4">
                        <StockList items={rawMaterials} />
                    </TabsContent>
                    <TabsContent value="finished_goods" className="mt-4">
                        <StockList items={finishedGoods} />
                    </TabsContent>
                </Tabs>
            </div>
        </IndexPageLayout>
    );
}
