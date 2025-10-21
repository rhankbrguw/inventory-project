import FormField from "@/Components/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";
import DatePicker from "@/Components/DatePicker";
import InputError from "@/Components/InputError";

export default function SellDetailsManager({
    data,
    setData,
    errors,
    locations,
    customers,
    paymentMethods,
    detailsDisabled,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Informasi Penjualan</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
                <FormField label="Lokasi Penjualan *" htmlFor="location_id">
                    <Select
                        value={data.location_id?.toString()}
                        onValueChange={(value) => setData("location_id", value)}
                        required
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
                    <InputError message={errors.location_id} />
                </FormField>

                <FormField
                    label="Tanggal Transaksi *"
                    htmlFor="transaction_date"
                >
                    <DatePicker
                        value={data.transaction_date}
                        onSelect={(date) => setData("transaction_date", date)}
                        disabled={detailsDisabled}
                    />
                    <InputError message={errors.transaction_date} />
                </FormField>

                <FormField label="Pelanggan" htmlFor="customer_id">
                    <Select
                        value={data.customer_id?.toString() || ""}
                        onValueChange={(value) =>
                            setData("customer_id", value || null)
                        }
                        disabled={detailsDisabled}
                    >
                        <SelectTrigger
                            id="customer_id"
                            disabled={detailsDisabled}
                        >
                            <SelectValue placeholder="Pilih pelanggan (opsional)" />
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
                    <InputError message={errors.customer_id} />
                </FormField>

                <FormField
                    label="Metode Pembayaran"
                    htmlFor="payment_method_type_id"
                >
                    <Select
                        value={data.payment_method_type_id?.toString() || ""}
                        onValueChange={(value) =>
                            setData("payment_method_type_id", value || null)
                        }
                        disabled={detailsDisabled}
                    >
                        <SelectTrigger
                            id="payment_method_type_id"
                            disabled={detailsDisabled}
                        >
                            <SelectValue placeholder="Pilih metode (opsional)" />
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
                    <InputError message={errors.payment_method_type_id} />
                </FormField>

                <FormField
                    label="Status Transaksi *"
                    htmlFor="status"
                    className="sm:col-span-2"
                >
                    <Select
                        value={data.status}
                        onValueChange={(value) => setData("status", value)}
                        required
                        disabled={detailsDisabled}
                    >
                        <SelectTrigger id="status" disabled={detailsDisabled}>
                            <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.status} />
                </FormField>

                <FormField
                    label="Catatan (Opsional)"
                    htmlFor="notes"
                    className="sm:col-span-2"
                >
                    <Textarea
                        id="notes"
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        rows={3}
                        placeholder="Catatan tambahan..."
                        disabled={detailsDisabled}
                    />
                    <InputError message={errors.notes} />
                </FormField>
            </CardContent>
        </Card>
    );
}
