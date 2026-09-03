import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useTranslation from '@/hooks/useTranslation';

export default function SellLocationChannelFilter({
    locations,
    selectedLocationId,
    onLocationChange,
    salesChannels,
    selectedChannelId,
    onChannelChange,
}) {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
                <Label htmlFor="location_id" className="text-xs">
                    {t('ui.location')}
                </Label>
                <Select
                    value={selectedLocationId}
                    onValueChange={onLocationChange}
                >
                    <SelectTrigger id="location_id" className="h-9 text-xs">
                        <SelectValue placeholder={t('ui.select_location')} />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                                {loc.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="channel_id" className="text-xs">
                    {t('ui.sales_channel_label')}
                </Label>
                <Select
                    value={selectedChannelId}
                    onValueChange={onChannelChange}
                >
                    <SelectTrigger id="channel_id" className="h-9 text-xs">
                        <SelectValue placeholder={t('ui.select_channel')} />
                    </SelectTrigger>
                    <SelectContent>
                        {salesChannels.map((channel) => (
                            <SelectItem
                                key={channel.id}
                                value={channel.id.toString()}
                            >
                                {channel.name} ({channel.code})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
