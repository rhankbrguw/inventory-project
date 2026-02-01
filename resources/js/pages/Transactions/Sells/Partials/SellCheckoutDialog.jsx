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
    const { data, setData, post, processing, errors, transform } = useForm({
        location_id: locationId || '',
        customer_id: customerId || null,
        target_location_id: targetLocationId || null,
        sales_channel_id: salesChannelId || null,
        transaction_date: getNormalizedDate(),
        notes: '',
        payment_method_type_id: '',
        installment_terms: '1',
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
                        <div className="p-3 rounded-lg border bg-muted/30">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Total Transaksi
                                </span>
                                <span className="text-sm font-bold text-foreground">
                                    {formatCurrency(totalPrice)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                label="Tanggal"
                                error={errors.transaction_date}
                            >
                                <DatePicker
                                    value={data.transaction_date}
                                    onSelect={(date) =>
                                        setData('transaction_date', date)
                                    }
                                    className="h-9 text-xs [&>button]:h-9"
                                />
                            </FormField>

                            <FormField
                                label="Pembayaran"
                                error={errors.payment_method_type_id}
                            >
                                <Select
                                    value={data.payment_method_type_id}
                                    onValueChange={(value) =>
                                        setData('payment_method_type_id', value)
                                    }
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Metode Bayar" />
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
                        </div>

                        <FormField
                            label="Cara Bayar"
                            error={errors.installment_terms}
                        >
                            <RadioGroup
                                value={data.installment_terms}
                                onValueChange={(value) =>
                                    setData('installment_terms', value)
                                }
                                className="grid grid-cols-3 gap-2"
                            >
                                <div className="flex items-center justify-center space-x-2 border p-2.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value="1" id="inst-1" />
                                    <Label
                                        htmlFor="inst-1"
                                        className="text-xs cursor-pointer font-medium"
                                    >
                                        Lunas (Full)
                                    </Label>
                                </div>
                                <div className="flex items-center justify-center space-x-2 border p-2.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value="2" id="inst-2" />
                                    <Label
                                        htmlFor="inst-2"
                                        className="text-xs cursor-pointer font-medium"
                                    >
                                        Cicilan 2x
                                    </Label>
                                </div>
                                <div className="flex items-center justify-center space-x-2 border p-2.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value="3" id="inst-3" />
                                    <Label
                                        htmlFor="inst-3"
                                        className="text-xs cursor-pointer font-medium"
                                    >
                                        Cicilan 3x
                                    </Label>
                                </div>
                            </RadioGroup>
                        </FormField>

                        <FormField
                            label="Catatan"
                            htmlFor="notes"
                            optional
                            error={errors.notes}
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
                        </FormField>

                        {errors.items && (
                            <InputError message="Terdapat kesalahan pada item keranjang." />
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                            className="h-9 text-xs"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-9 text-xs"
                        >
                            {processing ? 'Memproses...' : 'Selesaikan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
