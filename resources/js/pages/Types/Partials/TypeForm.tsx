import FormField from '@/components/FormField';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import UnifiedBadge from '@/components/UnifiedBadge';
import { Info } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function TypeForm({
    data,
    setData,
    errors,
    availableGroups,
    availableLevels,
    allTypes,
    currentType = null,
    isEdit = false,
}) {
    const { t } = useTranslation();
    const currentGroupHasLevels = data.group && availableLevels[data.group];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    label={t('ui.type_name')}
                    htmlFor="name"
                    error={errors.name}
                >
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t('ui.type_name_placeholder')}
                    />
                </FormField>

                <FormField
                    label={t('ui.type_group')}
                    htmlFor="group"
                    error={errors.group}
                    description={
                        data.group && availableGroups[data.group]?.description
                    }
                >
                    <Select
                        value={data.group}
                        onValueChange={(value) => {
                            if (isEdit) {
                                setData('group', value);
                            } else {
                                setData((prev) => ({
                                    ...prev,
                                    group: value,
                                    level: null,
                                }));
                            }
                        }}
                        disabled={isEdit}
                    >
                        <SelectTrigger id="group">
                            <SelectValue placeholder={t('ui.select_group')} />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(availableGroups as Record<string, { label?: string }>).map(
                                ([groupKey, groupItem]) => (
                                    <SelectItem key={groupKey} value={groupKey}>
                                        {groupItem?.label || groupKey}
                                    </SelectItem>
                                )
                            )}
                        </SelectContent>
                    </Select>
                </FormField>
            </div>

            {currentGroupHasLevels && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        label={t('ui.access_level_category')}
                        htmlFor="level"
                        error={errors.level}
                        description={isEdit ? t('ui.adjust_level_desc') : t('ui.access_level_desc')}
                    >
                        <Select
                            value={data.level ? data.level.toString() : ''}
                            onValueChange={(value) => setData('level', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={isEdit ? t('ui.select_level') : t('ui.select_access_level')} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableLevels[data.group].map((lvl) => (
                                    <SelectItem
                                        key={lvl.value}
                                        value={lvl.value.toString()}
                                    >
                                        {lvl.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>
            )}

            {data.group && allTypes[data.group] && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>{t('ui.types_in_this_group')}</AlertTitle>
                    <AlertDescription className="flex flex-wrap gap-2 pt-2">
                        {allTypes[data.group]
                            .filter((t) => !currentType || t.id !== currentType.id)
                            .map((type) => (
                                <UnifiedBadge
                                    key={type.id}
                                    text={`${type.name}${type.level ? ` (Lvl ${type.level})` : ''}`}
                                    code={type.code}
                                />
                            ))}
                    </AlertDescription>
                </Alert>
            )}

            <FormField
                label={t('ui.code_optional')}
                htmlFor="code"
                error={errors.code}
                description={t('ui.short_code_reference')}
            >
                <Input
                    id="code"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value)}
                    placeholder={t('ui.type_code_placeholder')}
                />
            </FormField>
        </div>
    );
}
