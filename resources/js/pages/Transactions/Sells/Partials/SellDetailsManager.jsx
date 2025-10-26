import FormField from "@/components/FormField";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import DatePicker from "@/components/DatePicker";

export default function SellDetailsManager({
    data,
    setData,
    errors,
    locations,
    customers,
    paymentMethods,
    isDetailsLocked,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Informasi Penjualan</CardTitle>
                <CardDescription>
                    {isDetailsLocked
                        ? "Pilih lokasi penjualan terlebih dahulu untuk mengisi item."
                        : "Pilih tanggal, pelanggan, dan detail transaksi lainnya."}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
                <FormField
                    label="Lokasi Penjualan"
                    htmlFor="location_id"
                    error={errors.location_id}
                >
                    <Select
                        value={data.location_id}
                        onValueChange={(value) => setData("location_id", value)}
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
                    label="Pelanggan (Opsional)"
                    htmlFor="customer_id"
                    error={errors.customer_id}
                >
                    <Select
                        value={data.customer_id || ""}
                        onValueChange={(value) =>
                            setData("customer_id", value || null)
                        }
                        disabled={isDetailsLocked}
                    >
                        <SelectTrigger id="customer_id">
                            <SelectValue placeholder="Pilih pelanggan" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map((cust) => (
                                <SelectItem
                                    key={cust.id}
                                    value={cust.id.toString()}
                                >
                                    {cust.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                <FormField
                    label="Metode Pembayaran"
                    htmlFor="payment_method_type_id"
                    error={errors.payment_method_type_id}
                >
                    <Select
                        value={data.payment_method_type_id || ""}
                        onValueChange={(value) =>
                            setData("payment_method_type_id", value || null)
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
                            placeholder="Catatan tambahan untuk penjualan..."
                            disabled={isDetailsLocked}
                        />
                    </FormField>
                </div>
            </CardContent>
        </Card>
    );
}
