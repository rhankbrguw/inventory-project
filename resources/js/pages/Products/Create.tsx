import { useForm, Link } from '@inertiajs/react';
import ContentPageLayout from '@/components/ContentPageLayout';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/useImageUpload';
import useTranslation from '@/hooks/useTranslation';
import ProductBasicInfo from './Partials/ProductBasicInfo';
import ProductPricingForm from './Partials/ProductPricingForm';

export default function Create({
    auth,
    types,
    suppliers,
    validUnits,
    salesChannels,
}) {
    const { data, setData, post, processing, errors, isDirty, transform } =
        useForm({
            name: '',
            image: null,
            type_id: '',
            suppliers: [],
            default_supplier_id: '',
            sku: '',
            price: '',
            unit: '',
            description: '',
            channel_prices: {},
        });

    const { preview, fileInputRef, handleChange, handleRemove, triggerInput } =
        useImageUpload();
    const { t } = useTranslation();

    const handleChannelPriceChange = (channelId, value) => {
        setData('channel_prices', {
            ...data.channel_prices,
            [channelId]: value,
        });
    };

    transform((data) => ({
        ...data,
        channel_prices: Object.fromEntries(
            Object.entries(data.channel_prices).filter(
                ([_, value]) => value && Number(value) > 0
            )
        ),
    }));

    const submit = (e) => {
        e.preventDefault();
        post(route('products.store'));
    };

    return (
        <ContentPageLayout
            auth={auth}
            title={t('ui.add_new_product')}
            backRoute="products.index"
        >
            <form onSubmit={submit} className="space-y-6">
                <ProductBasicInfo
                    data={data}
                    setData={setData}
                    errors={errors}
                    types={types}
                    suppliers={suppliers}
                    validUnits={validUnits}
                    fileInputRef={fileInputRef}
                    handleChange={handleChange}
                    handleRemove={handleRemove}
                    triggerInput={triggerInput}
                    preview={preview}
                />

                <ProductPricingForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    salesChannels={salesChannels}
                    handleChannelPriceChange={handleChannelPriceChange}
                />

                <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t">
                    <Link href={route('products.index')}>
                        <Button type="button" variant="outline">
                            {t('ui.cancel')}
                        </Button>
                    </Link>
                    <Button disabled={processing || !isDirty}>
                        {t('ui.save_product')}
                    </Button>
                </div>
            </form>
        </ContentPageLayout>
    );
}
