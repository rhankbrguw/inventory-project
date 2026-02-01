import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import FormField from '@/components/FormField';
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
import { DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getNormalizedDate, formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

export default function PurchaseDetailsManager({
    supplierId,
    fromLocationId,
    locations,
    suppliers,
    paymentMethods,
    cartItems,
    onClose,
}) {
    const { data, setData, post, processing, errors, transform } = useForm({
        location_id: '',
        supplier_id: supplierId,
        from_location_id: fromLocationId,
        transaction_date: getNormalizedDate(),
        notes: '',
        payment_method_type_id: '',
        installment_terms: '1',
        items: cartItems.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            cost_per_unit: item.cost_per_unit,
        })),
    });

    const isInternal = !!fromLocationId;

    const totalAmount = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            return sum + item.quantity * item.cost_per_unit;
        }, 0);
    }, [cartItems]);

    const getSourceName = () => {
        if (isInternal) return 'Gudang Pusat (Internal)';
        if (!supplierId || supplierId === 'null' || supplierId === null)
            return 'Supplier Umum';
        const supplier = suppliers.find(
            (s) => s.id === supplierId || s.id.toString() === supplierId
        );
        return supplier?.name || 'Supplier Umum';
    };

    const submit = (e) => {
        e.preventDefault();
        transform((data) => ({
            ...data,
            transaction_date: format(data.transaction_date, 'yyyy-MM-dd'),
            installment_terms: parseInt(data.installment_terms),
        }));
        post(route('transactions.purchases.store'), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1">
                <FormField
                    label={isInternal ? 'Sumber Stok' : 'Supplier'}
                    htmlFor="source_display"
                >
                    <Input
                        id="source_display"
                        value={getSourceName()}
                        readOnly
                        disabled
                        className="h-9 text-xs bg-muted/50 cursor-not-allowed"
                    />
                </FormField>

                <FormField
                    label={
                        isInternal
                            ? 'Tujuan (Cabang Anda)'
                            : 'Lokasi Penerimaan'
                    }
                    htmlFor="location_id"
                    error={errors.location_id}
                >
                    <Select
                        value={data.location_id}
                        onValueChange={(value) => setData('location_id', value)}
                    >
                        <SelectTrigger id="location_id" className="h-9 text-xs">
                            <SelectValue placeholder="Pilih Lokasi" />
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

                <div className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-muted-foreground">
                            Total Transaksi
                        </span>
                        <span className="text-sm font-bold text-foreground">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <FormField label="Tanggal" error={errors.transaction_date}>
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

                <FormField label="Cara Bayar" error={errors.installment_terms}>
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
                                Lunas (Bayar Penuh)
                            </Label>
                        </div>
                        <div className="flex items-center justify-center space-x-2 border p-2.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="2" id="inst-2" />
                            <Label
                                htmlFor="inst-2"
                                className="text-xs cursor-pointer font-medium"
                            >
                                Cicilan 2x (Bulanan)
                            </Label>
                        </div>
                        <div className="flex items-center justify-center space-x-2 border p-2.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="3" id="inst-3" />
                            <Label
                                htmlFor="inst-3"
                                className="text-xs cursor-pointer font-medium"
                            >
                                Cicilan 3x (Bulanan)
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
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Catatan transaksi..."
                        className="h-9 text-xs"
                    />
                </FormField>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
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
    );
}
