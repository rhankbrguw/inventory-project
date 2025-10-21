import { useForm, usePage } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import { Button } from "@/Components/ui/button";
import SellDetailsManager from "../Partials/SellDetailsManager";
import SellItemManager from "../Partials/SellItemManager";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export default function Create({
    auth,
    locations,
    customers,
    allProducts,
    paymentMethods,
}) {
    const { data, setData, post, processing, errors, reset, isDirty } = useForm(
        {
            location_id: "",
            customer_id: null,
            transaction_date: new Date(),
            payment_method_type_id: null,
            notes: "",
            status: "Completed",
            items: [{ product_id: null, quantity: "", sell_price: "" }],
        }
    );

    const totalPrice = data.items.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.sell_price) || 0;
        return sum + quantity * price;
    }, 0);

    const submit = (e) => {
        e.preventDefault();
        post(route("transactions.sells.store"), {
            transform: (data) => ({
                ...data,
                transaction_date: format(data.transaction_date, "yyyy-MM-dd"),
            }),
        });
    };

    const detailsDisabled = !data.location_id;
    const isSubmitDisabled =
        processing ||
        !isDirty ||
        detailsDisabled ||
        data.items.length === 0 ||
        !data.items[0].product_id ||
        !data.items[0].quantity ||
        !data.items[0].sell_price;

    return (
        <ContentPageLayout
            auth={auth}
            title="Buat Penjualan Item"
            backRoute="transactions.index"
        >
            <form onSubmit={submit} className="space-y-6">
                <SellDetailsManager
                    data={data}
                    setData={setData}
                    errors={errors}
                    locations={locations}
                    customers={customers}
                    paymentMethods={paymentMethods}
                    detailsDisabled={detailsDisabled}
                />

                <SellItemManager
                    items={data.items}
                    allProducts={allProducts}
                    setData={setData}
                    errors={errors}
                    locationId={data.location_id}
                    itemsDisabled={detailsDisabled}
                />

                <div className="flex items-center justify-between gap-3 pt-4 border-t">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Total Penjualan <br />
                        <span className="text-lg sm:text-xl font-bold text-foreground">
                            {formatCurrency(totalPrice)}
                        </span>
                    </p>
                    <div className="flex gap-2">
                        <Link href={route("transactions.index")}>
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
                            disabled={isSubmitDisabled}
                        >
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </div>
            </form>
        </ContentPageLayout>
    );
}
