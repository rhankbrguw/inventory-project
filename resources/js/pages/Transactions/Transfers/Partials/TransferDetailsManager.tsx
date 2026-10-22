import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import FormField from '@/components/FormField';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useTranslation from '@/hooks/useTranslation';

export default function TransferDetailsManager({
    data,
    setData,
    errors,
    sourceLocations,
    destinationLocations,
    isDetailsLocked = false,
    ...rest
}: {
    data: any;
    setData: any;
    errors: any;
    sourceLocations: any;
    destinationLocations: any;
    isDetailsLocked?: boolean;
    [key: string]: unknown;
}) {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('ui.transfer_details')}</CardTitle>
                <CardDescription>
                    {t('ui.transfer_details_desc')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label={t('ui.from_location_origin')}
                        error={errors.from_location_id}
                    >
                        <Select
                            value={data.from_location_id}
                            onValueChange={(value) =>
                                setData('from_location_id', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('ui.select_origin_location')} />
                            </SelectTrigger>
                            <SelectContent>
                                {sourceLocations.map((loc) => (
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

                    <FormField
                        label={t('ui.to_location_dest')}
                        error={errors.to_location_id}
                    >
                        <Select
                            value={data.to_location_id}
                            onValueChange={(value) =>
                                setData('to_location_id', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('ui.select_dest_location2')} />
                            </SelectTrigger>
                            <SelectContent>
                                {destinationLocations.map((loc) => (
                                    <SelectItem
                                        key={loc.id}
                                        value={loc.id.toString()}
                                        disabled={
                                            loc.id.toString() ===
                                            data.from_location_id
                                        }
                                    >
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>
                <FormField label={t('ui.notes_optional')} error={errors.notes}>
                    <Textarea
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder={t('ui.transfer_notes_placeholder2')}
                    />
                </FormField>
            </CardContent>
        </Card>
    );
}
