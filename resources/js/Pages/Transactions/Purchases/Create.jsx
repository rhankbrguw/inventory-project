import { Link, useForm } from "@inertiajs/react";
import { useEffect } from "react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import PurchaseItemManager from "../Partials/PurchaseItemManager";
import TransactionDetailsManager from "../Partials/PurchaseDetailsManager";
import { Button } from "@/Components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export default function Create({
    auth,
    locations,
    suppliers,
    products,
    paymentMethods,
}) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        location_id: "",
        supplier_id: "",
        transaction_date: new Date(),
        notes: "",
        payment_method_type_id: "",
        items: [
            {
                product_id: "",
                supplier_id: null,
                quantity: 1,
                cost_per_unit: "",
            },
        ],
    });

    const isDetailsLocked = !data.items[0]?.product_id;
    const selectedProductIds = data.items
        .map((item) => item.product_id)
        .filter(Boolean);

    useEffect(() => {
        const firstItemSupplier = data.items[0]?.supplier_id;
        if (firstItemSupplier) {
            setData("supplier_id", firstItemSupplier);
        }
    }, [data.items[0]?.supplier_id]);

    const calculateTotal = () => {
        return data.items.reduce((total, item) => {
            return total + Number(item.quantity) * Number(item.cost_per_unit);
        }, 0);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("transactions.purchases.store"), {
            transform: (data) => ({
                ...data,
                transaction_date: format(data.transaction_date, "yyyy-MM-dd"),
            }),
        });
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Buat Pembelian Item"
            backRoute="transactions.index"
        >
            <form onSubmit={submit} className="space-y-4">
                <PurchaseItemManager
                    items={data.items}
                    products={products}
                    suppliers={suppliers}
                    setData={setData}
                    errors={errors}
                    selectedProductIds={selectedProductIds}
                />

                <TransactionDetailsManager
                    data={data}
                    setData={setData}
                    errors={errors}
                    locations={locations}
                    suppliers={suppliers}
                    paymentMethods={paymentMethods}
                    isDetailsLocked={isDetailsLocked}
                />

                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Total Pembelian <br />
                        <span className="text-lg sm:text-xl font-bold text-foreground">
                            {formatCurrency(calculateTotal())}
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
