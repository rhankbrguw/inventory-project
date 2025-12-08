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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
        installment_terms: "1",
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

    const getRoleDisplayName = (code) => {
        const roleNames = {
            WHM: "Warehouse Manager",
            BRM: "Branch Manager",
            CSH: "Cashier",
            STF: "Staff",
        };
        return roleNames[code] || code;
    };

    const availableLocations = locations.filter((loc) => loc.can_purchase);

    const submit = (e) => {
        e.preventDefault();
        post(route("transactions.purchases.store"), {
            transform: (formData) => ({
                ...formData,
                transaction_date: format(
                    formData.transaction_date,
                    "yyyy-MM-dd",
                ),
                installment_terms: parseInt(formData.installment_terms),
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
                            {availableLocations.length > 0 ? (
                                availableLocations.map((loc) => (
                                    <SelectItem
                                        key={loc.id}
                                        value={loc.id.toString()}
                                    >
                                        {loc.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="none" disabled>
                                    Tidak ada lokasi yang tersedia
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    {availableLocations.length === 0 && (
                        <p className="text-xs text-destructive mt-1">
                            Anda tidak memiliki izin pembelian di lokasi manapun
                        </p>
                    )}
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
                    label="Cara Bayar"
                    labelClassName="text-xs font-semibold text-foreground"
                >
                    <RadioGroup
                        value={data.installment_terms}
                        onValueChange={(value) =>
                            setData("installment_terms", value)
                        }
                        className="flex flex-col space-y-2"
                    >
                        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="1" id="installment-1" />
                            <Label
                                htmlFor="installment-1"
                                className="flex-1 cursor-pointer text-xs font-medium"
                            >
                                Lunas (Bayar Penuh)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="2" id="installment-2" />
                            <Label
                                htmlFor="installment-2"
                                className="flex-1 cursor-pointer text-xs font-medium"
                            >
                                Cicilan 2x (Bulanan)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="3" id="installment-3" />
                            <Label
                                htmlFor="installment-3"
                                className="flex-1 cursor-pointer text-xs font-medium"
                            >
                                Cicilan 3x (Bulanan)
                            </Label>
                        </div>
                    </RadioGroup>
                    <InputError message={errors.installment_terms} />
                </FormField>

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
                    disabled={
                        processing ||
                        !isDirty ||
                        availableLocations.length === 0
                    }
                    className="h-9 text-xs font-semibold"
                >
                    {processing ? "Memproses..." : "Buat Pesanan"}
                </Button>
            </DialogFooter>
        </form>
    );
}
