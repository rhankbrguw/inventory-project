import ContentPageLayout from "@/components/ContentPageLayout";
import { Link } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import StockMovementMobileCard from "../StockMovements/Partials/StockMovementMobileCard";
import { Eye } from "lucide-react";
import DataTable from "@/components/DataTable";
import { stockMovementPreviewColumns } from "@/constants/tableColumns";

export default function Show({ auth, inventory, stockMovements }) {
    const inventoryData = inventory.data || inventory;

    return (
        <ContentPageLayout
            auth={auth}
            title="Informasi Stok"
            backRoute="stock.index"
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{inventoryData.product?.name}</CardTitle>
                        <CardDescription>
                            SKU: {inventoryData.product?.sku}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Lokasi</p>
                            <p className="font-semibold">
                                {inventoryData.location?.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">
                                Jumlah Stok Saat Ini
                            </p>
                            <p className="font-semibold text-lg">
                                {formatNumber(inventoryData.quantity)}{" "}
                                {inventoryData.product?.unit}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">
                                Harga Pokok Rata-Rata (HPP)
                            </p>
                            <p className="font-semibold">
                                {formatCurrency(inventoryData.average_cost)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Pergerakan Terakhir</CardTitle>
                            <Link
                                href={route("stock-movements.index", {
                                    product_id: inventoryData.product.id,
                                    location_id: inventoryData.location.id,
                                })}
                            >
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="sm:hidden"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:inline-flex"
                                >
                                    Lihat Riwayat Item Ini
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="md:hidden space-y-3">
                            {stockMovements.data.length > 0 ? (
                                stockMovements.data.map((movement) => (
                                    <StockMovementMobileCard
                                        key={movement.id}
                                        movement={movement}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-center text-muted-foreground py-10">
                                    Belum ada pergerakan stok untuk item ini.
                                </p>
                            )}
                        </div>

                        <div className="hidden md:block">
                            {stockMovements.data.length > 0 ? (
                                <DataTable
                                    columns={stockMovementPreviewColumns}
                                    data={stockMovements.data}
                                />
                            ) : (
                                <div className="text-center text-sm text-muted-foreground py-10">
                                    Belum ada pergerakan stok untuk item ini.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ContentPageLayout>
    );
}
