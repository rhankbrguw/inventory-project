import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import FormField from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ProductCombobox from '@/components/ProductCombobox';
import StockAvailability from '@/components/StockAvailability';
import AdjustmentPreviewCard from './Partials/AdjustmentPreviewCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import InputError from '@/components/InputError';
import useTranslation from '@/hooks/useTranslation';

export default function Adjust({ auth, products, locations }) {
    const { t } = useTranslation();
    const [currentStock, setCurrentStock] = useState(null);
    const locationsData = locations.data || locations || [];
    const initialLocationId = locationsData.length === 1 ? locationsData[0].id.toString() : '';
    const { data, setData, post, processing, errors, isDirty, reset } = useForm({ product_id: '', location_id: initialLocationId, mode: 'absolute', quantity: '', notes: '' });
    const productsData = products.data || products || [];
    const selectedProduct = data.product_id ? productsData.find((p) => p.id == data.product_id) : null;
    const isFormDisabled = !data.product_id || !data.location_id;

    const submit = (e) => { e.preventDefault(); post(route('stock.adjust'), { onSuccess: () => reset() }); };

    const getQuantityLabel = () => {
        if (data.mode === 'reduction') return t('ui.quantity_reduction');
        if (data.mode === 'addition') return t('ui.quantity_addition');
        return t('ui.quantity_opname');
    };

    const getQuantityPlaceholder = () => {
        if (data.mode === 'reduction') return t('ui.enter_quantity_reduction');
        if (data.mode === 'addition') return t('ui.enter_quantity_addition');
        return t('ui.enter_quantity_opname');
    };

    return (
        <ContentPageLayout auth={auth} title={t('ui.stock_adjustment')} backRoute="stock.index">
            <Card>
                <CardHeader><CardTitle>{t('ui.stock_adjustment_form')}</CardTitle><CardDescription>{t('ui.stock_adjustment_desc')}</CardDescription></CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label={t('ui.product_label')} htmlFor="product_id">
                                <ProductCombobox products={productsData} value={data.product_id} onChange={(p) => setData('product_id', String(p.id))} error={errors.product_id} placeholder={t('ui.search_product_placeholder')} />
                                {data.location_id && data.product_id && <StockAvailability productId={data.product_id} locationId={data.location_id} unit={selectedProduct?.unit} onStockLoaded={setCurrentStock} />}
                            </FormField>
                            <FormField label={t('ui.location_label')} htmlFor="location_id">
                                <Select value={data.location_id?.toString()} onValueChange={(v) => setData('location_id', v)}>
                                    <SelectTrigger id="location_id"><SelectValue placeholder={t('ui.select_storage_location')} /></SelectTrigger>
                                    <SelectContent>{locationsData.map((loc) => <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <InputError message={errors.location_id} />
                            </FormField>
                        </div>

                        <AdjustmentPreviewCard mode={data.mode} onModeChange={(m) => setData('mode', m)} currentStock={currentStock} inputQty={data.quantity} unit={selectedProduct?.unit || 'Pcs'} disabled={isFormDisabled} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label={getQuantityLabel()} htmlFor="quantity">
                                <Input id="quantity" type="number" step="any" min="0" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} placeholder={getQuantityPlaceholder()} disabled={isFormDisabled} />
                                <InputError message={errors.quantity} />
                            </FormField>
                        </div>
                        <FormField label={t('ui.notes_label')} htmlFor="notes">
                            <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder={t('ui.adjustment_reason_placeholder')} disabled={isFormDisabled} />
                            <InputError message={errors.notes} />
                        </FormField>
                        <div className="flex items-center justify-end gap-4 pt-2">
                            <Link href={route('stock.index')}><Button type="button" variant="outline">{t('ui.cancel')}</Button></Link>
                            <Button disabled={processing || !isDirty || isFormDisabled}>{t('ui.save')}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </ContentPageLayout>
    );
}
