import { useForm, Link } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';
import ProductBasicInfo from './Partials/ProductBasicInfo';
import ProductBasicInfoReadOnly from './Partials/ProductBasicInfoReadOnly';
import ProductPricing from './Partials/ProductPricing';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import LocalSupplierSelect from './Partials/LocalSupplierSelect';

export default function Edit({ auth, product: productResource, localOverride, types, suppliers, validUnits, salesChannels }) {
    const { data: product } = productResource;
    const isSuperAdmin = auth.user.level === auth.role_definitions.SUPER_ADMIN;
    const isLocalProduct = product.location_id !== null;
    const canFullEdit = isSuperAdmin || isLocalProduct;
    const isLocalUser = !isSuperAdmin;
    const initialChannelPrices = isLocalUser && !isLocalProduct ? { ...product.channel_prices, ...(localOverride?.channel_prices_override || {}) } : product.channel_prices || {};
    const { t } = useTranslation();

    const { data, setData, post, errors, processing, isDirty, transform } = useForm({
        name: product.name || '', sku: product.sku || '', price: (!isLocalProduct && localOverride?.selling_price) || product.price || '',
        unit: product.unit || '', description: product.description || '', image: null, type_id: product.type?.id?.toString() || '',
        suppliers: product.suppliers ? product.suppliers.map((s) => s.id) : [],
        default_supplier_id: (!isLocalProduct && localOverride?.local_supplier_id?.toString()) || product.default_supplier?.id?.toString() || '',
        channel_prices: initialChannelPrices, _method: 'patch',
    });

    const { preview, fileInputRef, handleChange, handleRemove, triggerInput } = useImageUpload(product.image_url);
    const handleChannelPriceChange = (channelId, value) => setData('channel_prices', { ...data.channel_prices, [channelId]: value });

    transform((d) => ({ ...d, channel_prices: Object.fromEntries(Object.entries(d.channel_prices).filter(([_, v]) => v && Number(v) > 0)) }));
    const submit = (e) => { e.preventDefault(); post(route('products.update', product.id), { forceFormData: true }); };
    const availableSuppliers = suppliers;

    return (
        <ContentPageLayout auth={auth} title={t('ui.edit_product')} backRoute="products.index">
            {isLocalUser && (
                <Alert className="mb-6"><AlertCircle className="h-4 w-4" /><AlertDescription>{isLocalProduct ? t('ui.local_product_full_access') : t('ui.global_product_limited_access')}</AlertDescription></Alert>
            )}
            <form onSubmit={submit} className="space-y-6">
                {canFullEdit ? (
                    <ProductBasicInfo data={data} setData={setData} errors={errors} types={types} suppliers={suppliers} validUnits={validUnits} fileInputRef={fileInputRef} handleChange={handleChange} handleRemove={handleRemove} triggerInput={triggerInput} preview={preview} />
                ) : (
                    <Card>
                        <CardHeader><CardTitle>{t('ui.product_info')}</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <ProductBasicInfoReadOnly product={product} /><LocalSupplierSelect data={data} setData={setData} errors={errors} product={product} availableSuppliers={availableSuppliers} />
                        </CardContent>
                    </Card>
                )}
                <ProductPricing data={data} setData={setData} errors={errors} product={product} salesChannels={salesChannels} isLocalUser={isLocalUser} isLocalProduct={isLocalProduct} handleChannelPriceChange={handleChannelPriceChange} t={t} />
                <div className="flex items-center justify-end gap-4 pt-4 border-t">
                    <Link href={route('products.index')}><Button type="button" variant="outline">{t('ui.cancel')}</Button></Link>
                    <Button type="submit" disabled={processing || !isDirty}>{processing ? t('ui.saving') : t('ui.save_changes')}</Button>
                </div>
            </form>
        </ContentPageLayout>
    );
}
