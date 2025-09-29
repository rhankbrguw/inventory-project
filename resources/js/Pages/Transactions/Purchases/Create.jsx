import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import FormField from "@/Components/FormField";
import PurchaseItemManager from "../Partials/PurchaseItemManager";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { formatCurrency } from "@/lib/utils";
import DatePicker from "@/Components/DatePicker";
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

    const handleDateSelect = (selectedDate) => {
        setData("transaction_date", selectedDate);
    };

    const calculateTotal = () => {
        return data.items.reduce((total, item) => {
            return total + Number(item.quantity) * Number(item.cost_per_unit);
        }, 0);
    };

    const submit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...data,
            transaction_date: format(data.transaction_date, "yyyy-MM-dd"),
        };
        post(route("transactions.purchases.store"), {
            data: submissionData,
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
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Transaksi</CardTitle>
                        <CardDescription>
                            Pilih lokasi, tanggal, dan detail transaksi lainnya.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-6">
                        <FormField
                            label="Lokasi Penerima"
                            htmlFor="location_id"
                            error={errors.location_id}
                        >
                            <Select
                                value={data.location_id}
                                onValueChange={(value) =>
                                    setData("location_id", value)
                                }
                            >
                                <SelectTrigger id="location_id">
                                    <SelectValue placeholder="Pilih lokasi" />
                                </SelectTrigger>
                                <SelectContent>
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
                        </FormField>
                        <FormField
                            label="Tanggal Transaksi"
                            error={errors.transaction_date}
                        >
                            <DatePicker
                                value={data.transaction_date}
                                onSelect={handleDateSelect}
                            />
                        </FormField>
                        <FormField
                            label="Metode Pembayaran (Opsional)"
                            htmlFor="payment_method_type_id"
                            error={errors.payment_method_type_id}
                        >
                            <Select
                                value={data.payment_method_type_id}
                                onValueChange={(value) =>
                                    setData("payment_method_type_id", value)
                                }
                            >
                                <SelectTrigger id="payment_method_type_id">
                                    <SelectValue placeholder="Pilih metode pembayaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((method) => (
                                        <SelectItem
                                            key={method.id}
                                            value={method.id.toString()}
                                        >
                                            {method.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField
                            label="Catatan (Opsional)"
                            htmlFor="notes"
                            error={errors.notes}
                        >
                            <Input
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                placeholder="Contoh: Nomor referensi faktur"
                            />
                        </FormField>
                    </CardContent>
                </Card>

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
                            disabled={processing || !isDirty}
                        >
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </div>
            </form>
        </ContentPageLayout>
    );
}
