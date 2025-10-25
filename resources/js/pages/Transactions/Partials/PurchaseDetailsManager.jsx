import FormField from "@/components/FormField";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import DatePicker from "@/components/DatePicker";

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
        <div className="space-y-2">
            <div>
                <h3 className="text-sm font-bold mb-0.5 text-gray-900">Informasi Pembelian</h3>
                <p className="text-[11px] text-muted-foreground">
                    {isDetailsLocked
                        ? "Pilih produk untuk mengisi detail"
                        : "Lengkapi detail transaksi"}
                </p>
            </div>

            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <FormField
                        label="Supplier"
                        htmlFor="supplier_id"
                        error={errors.supplier_id}
                        labelClassName="text-[10px] font-semibold text-gray-700"
                    >
                        <Select
                            value={data.supplier_id}
                            onValueChange={(value) => setData("supplier_id", value)}
                            disabled={isDetailsLocked || !!data.supplier_id}
                        >
                            <SelectTrigger id="supplier_id" className="h-8 text-xs">
                                <SelectValue placeholder="Pilih supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((sup) => (
                                    <SelectItem key={sup.id} value={sup.id.toString()}>
                                        {sup.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label="Lokasi"
                        htmlFor="location_id"
                        error={errors.location_id}
                        labelClassName="text-[10px] font-semibold text-gray-700"
                    >
                        <Select
                            value={data.location_id}
                            onValueChange={(value) => setData("location_id", value)}
                            disabled={isDetailsLocked}
                        >
                            <SelectTrigger id="location_id" className="h-8 text-xs">
                                <SelectValue placeholder="Pilih lokasi" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((loc) => (
                                    <SelectItem key={loc.id} value={loc.id.toString()}>
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <FormField
                        label="Tanggal"
                        error={errors.transaction_date}
                        labelClassName="text-[10px] font-semibold text-gray-700"
                    >
                        <DatePicker
                            value={data.transaction_date}
                            onSelect={(date) => setData("transaction_date", date)}
                            disabled={isDetailsLocked}
                            className="h-8 text-xs [&>button]:h-8"
                        />
                    </FormField>

                    <FormField
                        label="Pembayaran"
                        htmlFor="payment_method_type_id"
                        error={errors.payment_method_type_id}
                        labelClassName="text-[10px] font-semibold text-gray-700"
                    >
                        <Select
                            value={data.payment_method_type_id}
                            onValueChange={(value) => setData("payment_method_type_id", value)}
                            disabled={isDetailsLocked}
                        >
                            <SelectTrigger id="payment_method_type_id" className="h-8 text-xs">
                                <SelectValue placeholder="Pilih metode" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods.map((method) => (
                                    <SelectItem key={method.id} value={method.id.toString()}>
                                        {method.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>

                <FormField
                    label="Catatan"
                    htmlFor="notes"
                    error={errors.notes}
                    labelClassName="text-[10px] font-semibold text-gray-700"
                    optional
                >
                    <Input
                        id="notes"
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        placeholder="Nomor faktur, referensi, dll"
                        disabled={isDetailsLocked}
                        className="h-8 text-xs"
                    />
                </FormField>
            </div>
        </div>
    );
}import FormField from "@/components/FormField";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import DatePicker from "@/components/DatePicker";

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
        <div className="space-y-3">
            <div>
                <h3 className="text-base font-bold mb-1 text-gray-900">Informasi Pembelian</h3>
                <p className="text-xs text-muted-foreground">
                    {isDetailsLocked
                        ? "Pilih produk terlebih dahulu untuk mengisi detail"
                        : "Lengkapi informasi detail transaksi pembelian"}
                </p>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                    <FormField
                        label="Supplier"
                        htmlFor="supplier_id"
                        error={errors.supplier_id}
                        labelClassName="text-xs font-semibold text-gray-700"
                    >
                        <Select
                            value={data.supplier_id}
                            onValueChange={(value) => setData("supplier_id", value)}
                            disabled={isDetailsLocked || !!data.supplier_id}
                        >
                            <SelectTrigger id="supplier_id" className="h-9 text-sm border-2 focus:ring-2">
                                <SelectValue placeholder="Pilih supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((sup) => (
                                    <SelectItem key={sup.id} value={sup.id.toString()}>
                                        {sup.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label="Lokasi Gudang"
                        htmlFor="location_id"
                        error={errors.location_id}
                        labelClassName="text-xs font-semibold text-gray-700"
                    >
                        <Select
                            value={data.location_id}
                            onValueChange={(value) => setData("location_id", value)}
                            disabled={isDetailsLocked}
                        >
                            <SelectTrigger id="location_id" className="h-9 text-sm border-2 focus:ring-2">
                                <SelectValue placeholder="Pilih lokasi" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((loc) => (
                                    <SelectItem key={loc.id} value={loc.id.toString()}>
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    <FormField
                        label="Tanggal Pembelian"
                        error={errors.transaction_date}
                        labelClassName="text-xs font-semibold text-gray-700"
                    >
                        <DatePicker
                            value={data.transaction_date}
                            onSelect={(date) => setData("transaction_date", date)}
                            disabled={isDetailsLocked}
                            className="h-9 text-sm border-2 [&>button]:h-9 focus-visible:ring-2"
                            calendarClassName="text-xs"
                        />
                    </FormField>

                    <FormField
                        label="Metode Bayar"
                        htmlFor="payment_method_type_id"
                        error={errors.payment_method_type_id}
                        labelClassName="text-xs font-semibold text-gray-700"
                    >
                        <Select
                            value={data.payment_method_type_id}
                            onValueChange={(value) => setData("payment_method_type_id", value)}
                            disabled={isDetailsLocked}
                        >
                            <SelectTrigger id="payment_method_type_id" className="h-9 text-sm border-2 focus:ring-2">
                                <SelectValue placeholder="Pilih metode" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods.map((method) => (
                                    <SelectItem key={method.id} value={method.id.toString()}>
                                        {method.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>

                <FormField
                    label="Catatan Tambahan"
                    htmlFor="notes"
                    error={errors.notes}
                    labelClassName="text-xs font-semibold text-gray-700"
                    optional
                >
                    <Input
                        id="notes"
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        placeholder="Contoh: Nomor faktur, referensi PO, dll"
                        disabled={isDetailsLocked}
                        className="h-9 text-sm border-2 focus-visible:ring-2"
                    />
                </FormField>
            </div>
        </div>
    );
}
