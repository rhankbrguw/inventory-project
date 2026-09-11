import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';
import FormField from '@/components/FormField';
import CurrencyInput from '@/components/CurrencyInput';

export default function ProductPricing({
    data,
    setData,
    errors,
    product,
    salesChannels,
    isLocalUser,
    isLocalProduct,
    handleChannelPriceChange,
    t
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    {t('ui.price_settings')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg border">
                    <FormField
                        label={
                            isLocalUser && !isLocalProduct
                                ? t('ui.local_price')
                                : t('ui.base_price')
                        }
                        htmlFor="price"
                        error={errors.price}
                        description={
                            isLocalUser && !isLocalProduct
                                ? `Global: Rp ${Number(product.global_price || product.price).toLocaleString('id-ID')}`
                                : t('ui.base_price_desc')
                        }
                    >
                        <CurrencyInput
                            id="price"
                            placeholder="Contoh: 50000"
                            value={data.price}
                            onValueChange={(value) =>
                                setData('price', value)
                            }
                            className="text-lg font-bold"
                            required
                        />
                    </FormField>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('ui.app_special_price')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {salesChannels
                            .filter((ch) => ch.code !== 'CASH')
                            .map((channel) => {
                                const globalPrice =
                                    product.channel_prices?.[
                                    channel.id
                                    ];
                                return (
                                    <FormField
                                        key={channel.id}
                                        label={`${t('ui.price')} ${channel.name}`}
                                        htmlFor={`price-${channel.id}`}
                                        error={
                                            errors[
                                            `channel_prices.${channel.id}`
                                            ]
                                        }
                                        description={
                                            isLocalUser && !isLocalProduct && globalPrice
                                                ? `Global: Rp ${Number(globalPrice).toLocaleString('id-ID')}`
                                                : null
                                        }
                                    >
                                        <CurrencyInput
                                            id={`price-${channel.id}`}
                                            placeholder={`${t('ui.follow_base_price')} (${data.price || 0})`}
                                            value={
                                                data.channel_prices[
                                                channel.id
                                                ]
                                            }
                                            onValueChange={(priceValue) =>
                                                handleChannelPriceChange(
                                                    channel.id,
                                                    priceValue
                                                )
                                            }
                                        />
                                    </FormField>
                                );
                            })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
