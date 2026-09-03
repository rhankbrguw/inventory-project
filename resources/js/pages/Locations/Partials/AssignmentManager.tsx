import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from '@/components/FormField';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import useTranslation from '@/hooks/useTranslation';

export default function AssignmentManager({
    assignments,
    allUsers = [],
    allRoles = [],
    locationType = {} as any,
    errors,
    setData,
}: {
    assignments: any[];
    allUsers?: any[];
    allRoles?: any[];
    locationType?: any;
    errors: any;
    setData: any;
}) {
    const { t } = useTranslation();
    const baseRoles = useMemo(() => (!allRoles ? [] : allRoles.filter((r) => r.level > 1)), [allRoles]);

    const getRolesForUser = (userId) => {
        if (!userId) return baseRoles;
        const user = allUsers.find((u) => u.id.toString() === userId.toString());
        let filtered = !user ? baseRoles : baseRoles.filter((role) => role.level >= user.global_level);
        if (locationType?.code === 'WH' || locationType?.level === 1) {
            filtered = filtered.filter((r) => r.code !== 'BRM');
        } else if (locationType?.code === 'BR' || locationType?.level === 2) {
            filtered = filtered.filter((r) => r.code !== 'WHM');
        }
        return filtered;
    };

    const addAssignment = () => setData('assignments', [...assignments, { user_id: '', role_id: '' }]);
    const removeAssignment = (index) => setData('assignments', assignments.filter((_, i) => i !== index));

    const updateAssignment = (index, field, value) => {
        const updated = assignments.map((a, i) => (i === index ? (field === 'user_id' ? { ...a, user_id: value, role_id: '' } : { ...a, [field]: value }) : a));
        setData('assignments', updated);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('ui.officers')}</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addAssignment} className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /><span className="hidden sm:inline">{t('ui.add_user')}</span>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {assignments.map((assignment, index) => {
                    const validRoles = getRolesForUser(assignment.user_id);
                    return (
                        <div key={index} className="flex items-start gap-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-grow">
                                <FormField error={errors[`assignments.${index}.user_id`]}>
                                    <Select value={assignment.user_id} onValueChange={(selectedId) => updateAssignment(index, 'user_id', selectedId)}>
                                        <SelectTrigger><SelectValue placeholder={t('ui.select_user')} /></SelectTrigger>
                                        <SelectContent>
                                            {allUsers.map((u) => {
                                                const isAssigned = assignments.some((a, i) => i !== index && a.user_id === u.id.toString());
                                                return (
                                                    <SelectItem key={u.id} value={u.id.toString()} disabled={isAssigned}>
                                                        {u.name} ({u.global_role_code}){isAssigned ? ` - ${t('ui.selected')}` : ''}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                                <FormField error={errors[`assignments.${index}.role_id`]}>
                                    <Select value={assignment.role_id} onValueChange={(selectedId) => updateAssignment(index, 'role_id', selectedId)} disabled={!assignment.user_id}>
                                        <SelectTrigger><SelectValue placeholder={t('ui.select_role')} /></SelectTrigger>
                                        <SelectContent>{validRoles.length > 0 ? validRoles.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>) : <SelectItem value="none" disabled>{t('ui.no_roles_available')}</SelectItem>}</SelectContent>
                                    </Select>
                                </FormField>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeAssignment(index)} className="text-destructive hover:text-destructive mt-1.5 shrink-0"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
