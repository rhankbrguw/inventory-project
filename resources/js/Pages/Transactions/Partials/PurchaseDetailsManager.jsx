import FormField from "@/Components/FormField";
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
import DatePicker from "@/Components/DatePicker";

export default function TransactionDetailsManager({
    data,
    setData,
    errors,
    locations,
    suppliers,
    paymentMethods,
    isDetailsLocked,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Informasi Pembelian</CardTitle>
                <CardDescription>
                    {isDetailsLocked
                        ? "Silakan isi minimal satu item pembelian di atas terlebih dahulu."
                        : "Pilih supplier, lokasi, tanggal, dan detail transaksi lainnya."}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
                <FormField
                    label="Supplier"
                    htmlFor="supplier_id"
                    error={errors.supplier_id}
                >
                    <Select
                        value={data.supplier_id}
                        onValueChange={(value) => setData("supplier_id", value)}
                        disabled={isDetailsLocked || !!data.supplier_id}
                    >
                        <SelectTrigger id="supplier_id">
                            <SelectValue placeholder="Pilih supplier" />
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
                    label="Lokasi Penerima"
                    htmlFor="location_id"
                    error={errors.location_id}
                >
                    <Select
                        value={data.location_id}
                        onValueChange={(value) => setData("location_id", value)}
                        disabled={isDetailsLocked}
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
                        onSelect={(date) => setData("transaction_date", date)}
                        disabled={isDetailsLocked}
                    />
                </FormField>
                <FormField
                    label="Metode Pembayaran"
                    htmlFor="payment_method_type_id"
                    error={errors.payment_method_type_id}
                >
                    <Select
                        value={data.payment_method_type_id}
                        onValueChange={(value) =>
                            setData("payment_method_type_id", value)
                        }
                        disabled={isDetailsLocked}
                    >
                        <SelectTrigger id="payment_method_type_id">
                            <SelectValue placeholder="Pilih metode" />
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
                <div className="sm:col-span-2">
                    <FormField
                        label="Catatan (Opsional)"
                        htmlFor="notes"
                        error={errors.notes}
                    >
                        <Input
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            placeholder="Contoh: Nomor referensi faktur"
                            disabled={isDetailsLocked}
                        />
                    </FormField>
                </div>
            </CardContent>
        </Card>
    );
}
