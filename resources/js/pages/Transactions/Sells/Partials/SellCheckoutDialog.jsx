import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import DatePicker from '@/components/DatePicker';
import { Button } from '@/components/ui/button';
import FormField from '@/components/FormField';
import InputError from '@/components/InputError';
import { formatCurrency, getNormalizedDate } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function SellCheckoutDialog({
    isOpen,
    onOpenChange,
    cartItems,
    totalPrice,
    locationId,
    customerId,
    targetLocationId,
    salesChannelId,
    paymentMethods,
}) {
    const { data, setData, post, processing, errors, isDirty, transform } =
        useForm({
            location_id: locationId || '',
            customer_id: customerId || null,
            target_location_id: targetLocationId || null,
            sales_channel_id: salesChannelId || null,
            transaction_date: getNormalizedDate(),
            notes: '',
            payment_method_type_id: '',
            installment_terms: '1',
            status: '',
            items: [],
        });

    useEffect(() => {
        if (isOpen) {
            setData({
                ...data,
                location_id: locationId,
                customer_id: customerId,
                target_location_id: targetLocationId,
                sales_channel_id: salesChannelId,
                transaction_date: data.transaction_date || getNormalizedDate(),
                payment_method_type_id: paymentMethods[0]?.id.toString() || '',
                installment_terms: '1',
                items: cartItems.map((item) => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    sell_price: item.sell_price || item.product.price,
                    sales_channel_id: item.sales_channel?.id || null,
                })),
            });
        }
    }, [
        isOpen,
        cartItems,
        locationId,
        customerId,
        targetLocationId,
        salesChannelId,
    ]);

    const submit = (e) => {
        e.preventDefault();

        transform((data) => ({
            ...data,
            transaction_date: format(data.transaction_date, 'yyyy-MM-dd'),
            installment_terms: parseInt(data.installment_terms),
        }));

        post(route('transactions.sells.store'), {
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Konfirmasi Penjualan</DialogTitle>
                    <DialogDescription>
                        Selesaikan transaksi dengan total{' '}
                        <span className="font-bold text-primary">
                            {formatCurrency(totalPrice)}
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                label="Tanggal"
                                labelClassName="text-xs font-semibold text-foreground"
                            >
                                <DatePicker
                                    value={data.transaction_date}
                                    onSelect={(date) =>
                                        setData('transaction_date', date)
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
                                        setData('payment_method_type_id', value)
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
                                <InputError
                                    message={errors.payment_method_type_id}
                                />
                            </FormField>
                        </div>

                        <FormField
                            label="Cara Bayar"
                            labelClassName="text-xs font-semibold text-foreground"
                        >
                            <RadioGroup
                                value={data.installment_terms}
                                onValueChange={(value) =>
                                    setData('installment_terms', value)
                                }
                                className="flex flex-col space-y-2"
                            >
                                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem
                                        value="1"
                                        id="sell-installment-1"
                                    />
                                    <Label
                                        htmlFor="sell-installment-1"
                                        className="flex-1 cursor-pointer text-xs font-medium"
                                    >
                                        Lunas (Bayar Penuh)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem
                                        value="2"
                                        id="sell-installment-2"
                                    />
                                    <Label
                                        htmlFor="sell-installment-2"
                                        className="flex-1 cursor-pointer text-xs font-medium"
                                    >
                                        Cicilan 2x (Bulanan)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem
                                        value="3"
                                        id="sell-installment-3"
                                    />
                                    <Label
                                        htmlFor="sell-installment-3"
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
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                placeholder="Catatan transaksi..."
                                className="h-9 text-xs"
                            />
                            <InputError message={errors.notes} />
                        </FormField>
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
                            disabled={processing || !isDirty}
                            className="h-9 text-xs font-semibold"
                        >
                            {processing ? 'Memproses...' : 'Selesaikan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
