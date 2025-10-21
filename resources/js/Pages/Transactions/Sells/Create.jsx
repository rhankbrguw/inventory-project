import { useForm, usePage } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import SellDetailsManager from "../Partials/SellDetailsManager";
import SellItemManager from "../Partials/SellItemManager";
import { formatCurrency } from "@/lib/utils";

export default function Create({
    auth,
    locations,
    customers,
    allProducts,
    paymentMethods,
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        location_id: "",
        customer_id: null,
        transaction_date: new Date(),
        payment_method_type_id: null,
        notes: "",
        status: "Completed",
        items: [{ product_id: null, quantity: "", sell_price: "" }],
    });

    const totalPrice = data.items.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.sell_price) || 0;
        return sum + quantity * price;
    }, 0);

    const submit = (e) => {
        e.preventDefault();
        post(route("transactions.sells.store"), {});
    };

    const detailsDisabled = !data.location_id;
    const isSubmitDisabled =
        processing ||
        detailsDisabled ||
        data.items.length === 0 ||
        !data.items[0].product_id ||
        !data.items[0].quantity ||
        !data.items[0].sell_price;

    return (
        <ContentPageLayout
            auth={auth}
            title="Buat Transaksi Penjualan Baru"
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

                <Card>
                    <CardContent className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-right sm:text-left w-full sm:w-auto">
                            <p className="text-sm text-muted-foreground">
                                Total Harga
                            </p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(totalPrice)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Link
                                href={route("transactions.index")}
                                className="w-full sm:w-auto"
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                >
                                    Batal
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className="w-full sm:w-auto"
                            >
                                {processing ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </ContentPageLayout>
    );
}
