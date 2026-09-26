import FormField from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InputWithPrefix } from '@/components/InputWithPrefix';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useTranslation from '@/hooks/useTranslation';

export function CustomerFormFields({ data, setData, errors, customerTypes }) {
    const { t } = useTranslation();

    return (
        <>
            <FormField label={t('ui.customer_name')} htmlFor="name" error={errors.name}>
                <Input id="name" placeholder={t('ui.customer_name_placeholder')} value={data.name} onChange={(e) => setData('name', e.target.value)} />
            </FormField>
            <FormField label={t('ui.customer_type')} htmlFor="type_id" error={errors.type_id}>
                <Select value={data.type_id?.toString() ?? ''} onValueChange={(v) => setData('type_id', v)}>
                    <SelectTrigger id="type_id"><SelectValue placeholder={t('ui.select_customer_type')} /></SelectTrigger>
                    <SelectContent>{customerTypes.data.map((tp) => <SelectItem key={tp.id} value={tp.id.toString()}>{tp.name}</SelectItem>)}</SelectContent>
                </Select>
            </FormField>
            <FormField label={t('ui.email')} htmlFor="email" error={errors.email}>
                <Input id="email" type="email" placeholder={t('ui.email_example')} value={data.email} onChange={(e) => setData('email', e.target.value)} />
            </FormField>
            <FormField label={t('ui.phone')} htmlFor="phone" error={errors.phone}>
                <InputWithPrefix prefix="+62" id="phone" placeholder={t('ui.phone_placeholder')} value={data.phone} onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))} />
            </FormField>
            <FormField label={t('ui.address_optional')} htmlFor="address" error={errors.address}>
                <Textarea id="address" placeholder={t('ui.customer_address_placeholder')} value={data.address} onChange={(e) => setData('address', e.target.value)} />
            </FormField>
        </>
    );
}
