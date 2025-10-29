import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/components/ContentPageLayout";
import TransferItemManager from "./Partials/TransferItemManager";
import TransferDetailsManager from "./Partials/TransferDetailsManager";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { format } from "date-fns";
import { useMemo } from "react";

export default function Create({ auth, locations, products }) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        from_location_id: "",
        to_location_id: "",
        transfer_date: new Date(),
        notes: "",
        items: [{ product_id: "", quantity: 1, unit: "" }],
    });

    const isDetailsLocked =
        !data.from_location_id || !data.items[0]?.product_id;
    const isItemManagerLocked = !data.from_location_id;

    const selectedProductIds = data.items
        .map((item) => item.product_id)
        .filter(Boolean);

    const availableProducts = useMemo(() => {
        if (!data.from_location_id) {
            return [];
        }
        return (products?.data || []).filter((product) =>
            product.locations?.some(
                (loc) => loc.id.toString() === data.from_location_id,
            ),
        );
    }, [data.from_location_id, products?.data]);

    const calculateTotals = () => {
        const totalItems = data.items.filter((item) => item.product_id).length;
        const totalQuantity = data.items.reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0,
        );
        return { totalItems, totalQuantity };
    };

    const { totalItems, totalQuantity } = calculateTotals();

    const submit = (e) => {
        e.preventDefault();
        post(route("stock-movements.transfers.store"), {
            transform: (data) => ({
                ...data,
                transfer_date: format(data.transfer_date, "yyyy-MM-dd"),
            }),
        });
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Buat Transfer Stok"
            backRoute="stock-movements.index"
        >
            <form onSubmit={submit} className="space-y-4">
                <TransferDetailsManager
                    data={data}
                    setData={setData}
                    errors={errors}
                    locations={locations}
                    isDetailsLocked={isDetailsLocked}
                />

                <TransferItemManager
                    items={data.items}
                    setData={setData}
                    products={availableProducts}
                    errors={errors}
                    selectedProductIds={selectedProductIds}
                    fromLocationId={data.from_location_id}
                    isLocked={isItemManagerLocked}
                />

                <div className="flex items-center justify-between gap-3">
                    <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        Total Item: {totalItems} | Qty:{" "}
                        {formatNumber(totalQuantity)}
                    </div>
                    <div className="flex gap-2">
                        <Link href={route("stock-movements.index")}>
                            <Button
                                variant="outline"
                                type="button"
                                size="sm"
                                className="px-3 py-1"
                            >
                                Batal
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            className="px-3 py-1"
                            disabled={processing || !isDirty || isDetailsLocked}
                        >
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </div>
            </form>
        </ContentPageLayout>
    );
}
