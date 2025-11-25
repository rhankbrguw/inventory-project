import React from "react";
import { useForm } from "@inertiajs/react";
import { format } from "date-fns";
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
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import InputError from "@/components/InputError";

export default function PurchaseDetailsManager({
    supplierId,
    locations,
    suppliers,
    paymentMethods,
    cartItems,
    onClose,
}) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        location_id: "",
        supplier_id: supplierId,
        transaction_date: new Date(),
        notes: "",
        payment_method_type_id: "",
        items: cartItems.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            cost_per_unit: item.cost_per_unit,
        })),
    });

    const getSupplierName = () => {
        if (data.supplier_id === null) return "Supplier Umum";
        return (
            suppliers.find((s) => s.id === data.supplier_id)?.name ||
            "Supplier Tidak Ditemukan"
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("transactions.purchases.store"), {
            transform: (formData) => ({
                ...formData,
                transaction_date: format(
                    formData.transaction_date,
                    "yyyy-MM-dd",
                ),
            }),
            onSuccess: () => onClose(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1">
                <FormField
                    label="Supplier"
                    htmlFor="supplier_id"
                    labelClassName="text-xs font-semibold text-foreground"
                >
                    <Input
                        id="supplier_id"
                        value={getSupplierName()}
                        readOnly
                        disabled
                        className="h-9 text-xs bg-muted/50 cursor-not-allowed"
                        placeholder="Supplier Umum"
                    />
                    <InputError message={errors.supplier_id} />
                </FormField>

                <FormField
                    label="Lokasi Penerimaan"
                    htmlFor="location_id"
                    labelClassName="text-xs font-semibold text-foreground"
                >
                    <Select
                        value={data.location_id}
                        onValueChange={(value) => setData("location_id", value)}
                    >
                        <SelectTrigger id="location_id" className="h-9 text-xs">
                            <SelectValue placeholder="Pilih Lokasi Penerimaan" />
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

                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        label="Tanggal"
                        labelClassName="text-xs font-semibold text-foreground"
                    >
                        <DatePicker
                            value={data.transaction_date}
                            onSelect={(date) =>
                                setData("transaction_date", date)
                            }
                            className="h-9 text-xs [&>button]:h-9"
                        />
                        <InputError message={errors.transaction_date} />
                    </FormField>

                    <FormField
                        label="Pembayaran"
                        htmlFor="payment_method_type_id"
                        labelClassName="text-xs font-semibold text-foreground"
                    >
                        <Select
                            value={data.payment_method_type_id}
                            onValueChange={(value) =>
                                setData("payment_method_type_id", value)
                            }
                        >
                            <SelectTrigger
                                id="payment_method_type_id"
                                className="h-9 text-xs"
                            >
                                <SelectValue placeholder="Pilih Metode Pembayaran" />
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
                </div>

                <FormField
                    label="Catatan"
                    htmlFor="notes"
                    optional
                    labelClassName="text-xs font-semibold text-foreground"
                >
                    <Input
                        id="notes"
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        placeholder="No. Faktur / Referensi PO..."
                        className="h-9 text-xs"
                    />
                    <InputError message={errors.notes} />
                </FormField>

                {errors.items && (
                    <InputError message="Error pada data item, cek keranjang Anda." />
                )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={processing}
                    className="h-9 text-xs font-semibold"
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={processing || !isDirty}
                    className="h-9 text-xs font-semibold"
                >
                    {processing ? "Memproses..." : "Buat Pesanan"}
                </Button>
            </DialogFooter>
        </form>
    );
}
