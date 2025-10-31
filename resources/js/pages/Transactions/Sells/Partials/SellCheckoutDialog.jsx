import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
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
import FormField from "@/components/FormField";
import InputError from "@/components/InputError";
import { formatCurrency } from "@/lib/utils";

export default function SellCheckoutDialog({
    isOpen,
    onOpenChange,
    cartItems,
    totalPrice,
    locationId,
    paymentMethods,
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        location_id: locationId || "",
        customer_id: null,
        transaction_date: new Date(),
        notes: "",
        payment_method_type_id: paymentMethods[0]?.id.toString() || "",
        status: "Completed",
        items: [],
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                ...data,
                location_id: locationId,
                transaction_date: new Date(),
                items: cartItems.map((item) => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    sell_price: item.product.price,
                })),
            });
            reset();
        }
    }, [isOpen, cartItems, locationId]);

    const submit = (e) => {
        e.preventDefault();
        post(route("transactions.sells.store"), {
            transform: (formData) => ({
                ...formData,
                transaction_date: format(
                    formData.transaction_date,
                    "yyyy-MM-dd",
                ),
            }),
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Konfirmasi Penjualan</DialogTitle>
                    <DialogDescription>
                        Selesaikan transaksi dengan total{" "}
                        <span className="font-bold text-primary">
                            {formatCurrency(totalPrice)}
                        </span>
                        .
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1 py-2">
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
                            <InputError
                                message={errors.payment_method_type_id}
                            />
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
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                placeholder="Nomor referensi, dll"
                                className="h-9 text-xs"
                            />
                            <InputError message={errors.notes} />
                        </FormField>
                        {errors.items && (
                            <InputError message="Error pada data item." />
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                            className="h-9 text-xs font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || cartItems.length === 0}
                            className="h-9 text-xs font-semibold"
                        >
                            {processing ? "Memproses..." : "Selesaikan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
