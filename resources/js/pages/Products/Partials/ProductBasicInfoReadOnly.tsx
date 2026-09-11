import React from 'react';
import useTranslation from '@/hooks/useTranslation';

export default function ProductBasicInfoReadOnly({ product }) {
    const { t } = useTranslation();

    return (
        <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t('ui.global_info_readonly')}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground text-xs mb-1">
                        {t('ui.product_name')}
                    </p>
                    <p className="font-medium">{product.name}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs mb-1">SKU</p>
                    <p className="font-medium">{product.sku}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs mb-1">
                        {t('ui.product_type')}
                    </p>
                    <p className="font-medium">{product.type?.name || '-'}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs mb-1">
                        {t('ui.unit')}
                    </p>
                    <p className="font-medium">{product.unit}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs mb-1">
                        {t('ui.global_price')}
                    </p>
                    <p className="font-medium">
                        Rp{' '}
                        {Number(
                            product.global_price || product.price
                        ).toLocaleString('id-ID')}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs mb-1">
                        {t('ui.global_supplier')}
                    </p>
                    <p className="font-medium">
                        {product.default_supplier?.name || '-'}
                    </p>
                </div>
            </div>
        </div>
    );
}
