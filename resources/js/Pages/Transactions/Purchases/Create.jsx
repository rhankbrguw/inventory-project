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

export default function Create({ auth, locations, suppliers, products }) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        location_id: "",
        supplier_id: "",
        transaction_date: new Date().toISOString().slice(0, 10),
        notes: "",
        items: [{ product_id: "", quantity: 1, cost_per_unit: "" }],
    });

    const calculateTotal = () => {
        return data.items.reduce((total, item) => {
            return total + Number(item.quantity) * Number(item.cost_per_unit);
        }, 0);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("transactions.purchases.store"));
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Buat Transaksi Pembelian"
            backRoute="transactions.index"
        >
            <form onSubmit={submit} className="space-y-4">
                <PurchaseItemManager
                    items={data.items}
                    products={products}
                    setData={setData}
                    errors={errors}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Transaksi</CardTitle>
                        <CardDescription>
                            Pilih lokasi, supplier, dan tanggal transaksi.
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
                            htmlFor="transaction_date"
                            error={errors.transaction_date}
                        >
                            <Input
                                id="transaction_date"
                                type="date"
                                value={data.transaction_date}
                                onChange={(e) =>
                                    setData("transaction_date", e.target.value)
                                }
                            />
                        </FormField>
                        <FormField
                            label="Supplier"
                            htmlFor="supplier_id"
                            error={errors.supplier_id}
                        >
                            <Select
                                value={data.supplier_id}
                                onValueChange={(value) =>
                                    setData("supplier_id", value)
                                }
                            >
                                <SelectTrigger id="supplier_id">
                                    <SelectValue placeholder="Pilih supplier (otomatis jika produk dipilih)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((sup) => (
                                        <SelectItem
                                            key={sup.id}
                                            value={sup.id.toString()}
                                        >
                                            {sup.name}
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
