import FormField from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useTranslation from '@/hooks/useTranslation';
import ProductImageUpload from './ProductImageUpload';
import { SupplierMultiSelect, DefaultSupplierSelect } from './ProductSupplierFields';

export default function ProductBasicInfo({ data, setData, errors, types, suppliers, validUnits, fileInputRef, handleChange, handleRemove, triggerInput, preview }) {
    const { t } = useTranslation();

    const handleSupplierToggle = (supplierId) => {
        const id = parseInt(supplierId);
        const current = [...data.suppliers];
        if (current.includes(id)) {
            setData({ ...data, suppliers: current.filter((s) => s !== id), default_supplier_id: data.default_supplier_id == id ? '' : data.default_supplier_id });
        } else {
            setData('suppliers', [...current, id]);
        }
    };

    const selectedSupplierObjects = suppliers.filter((s) => data.suppliers.includes(s.id));
    const getSupplierDisplayText = () => {
        if (data.suppliers.length === 0) return t('ui.select_supplier_multiple');
        if (data.suppliers.length === 1) return suppliers.find((s) => s.id === data.suppliers[0])?.name || `1 ${t('ui.supplier_selected')}`;
        return `${data.suppliers.length} ${t('ui.supplier_selected')}`;
    };

    return (
        <Card>
            <CardHeader><CardTitle>{t('ui.product_info')}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <ProductImageUpload errors={errors} fileInputRef={fileInputRef} handleChange={handleChange} handleRemove={handleRemove} triggerInput={triggerInput} preview={preview} setData={setData} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label={t('ui.product_name')} htmlFor="name" error={errors.name}>
                        <Input id="name" value={data.name} placeholder={t('ui.product_name_placeholder')} onChange={(e) => setData('name', e.target.value)} required />
                    </FormField>
                    <FormField label={t('ui.product_type')} htmlFor="type_id" error={errors.type_id}>
                        <Select onValueChange={(v) => setData('type_id', v)} value={data.type_id?.toString()} required>
                            <SelectTrigger><SelectValue placeholder={t('ui.select_product_type')} /></SelectTrigger>
                            <SelectContent>{types.map((tp) => <SelectItem key={tp.id} value={tp.id.toString()}>{tp.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label={t('ui.sku')} htmlFor="sku" error={errors.sku}>
                        <Input id="sku" value={data.sku} placeholder={t('ui.sku_placeholder')} onChange={(e) => setData('sku', e.target.value)} required />
                    </FormField>
                    <FormField label={t('ui.unit')} htmlFor="unit" error={errors.unit}>
                        <Select value={data.unit} onValueChange={(v) => setData('unit', v)} required>
                            <SelectTrigger><SelectValue placeholder={t('ui.select_unit')} /></SelectTrigger>
                            <SelectContent>{validUnits.map((u) => <SelectItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</SelectItem>)}</SelectContent>
                        </Select>
                    </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SupplierMultiSelect data={data} errors={errors} suppliers={suppliers} getSupplierDisplayText={getSupplierDisplayText} handleSupplierToggle={handleSupplierToggle} />
                    <DefaultSupplierSelect data={data} setData={setData} errors={errors} selectedSupplierObjects={selectedSupplierObjects} />
                </div>

                <FormField label={t('ui.description_optional')} htmlFor="description" error={errors.description}>
                    <Textarea id="description" value={data.description} placeholder={t('ui.description_placeholder')} onChange={(e) => setData('description', e.target.value)} className="h-24" />
                </FormField>
            </CardContent>
        </Card>
    );
}
