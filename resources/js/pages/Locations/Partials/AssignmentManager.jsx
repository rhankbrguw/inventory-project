import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import FormField from "@/components/FormField";
import { PlusCircle, Trash2 } from "lucide-react";
import { useMemo } from "react";

export default function AssignmentManager({
    assignments,
    allUsers = [],
    allRoles = [],
    locationType = {},
    errors,
    setData,
}) {

    const baseRoles = useMemo(() => {
        if (!allRoles || allRoles.length === 0) return [];

        const level = locationType?.level;

        if (level === 1) {
            return allRoles.filter((r) => ["WHM", "STF"].includes(r.code));
        }

        if (level === 2) {
            return allRoles.filter((r) =>
                ["BRM", "CSH", "STF"].includes(r.code),
            );
        }

        return allRoles;
    }, [locationType, allRoles]);

    const getRolesForUser = (userId) => {
        if (!userId) return baseRoles;
        if (!allUsers) return baseRoles;

        const user = allUsers.find(
            (u) => u.id.toString() === userId.toString(),
        );
        if (!user) return baseRoles;

        const isGlobalManager = user.global_level <= 10;

        let isHomeTurf = false;
        if (user.global_role_code === "WHM" && locationType?.level === 1)
            isHomeTurf = true;
        if (user.global_role_code === "BRM" && locationType?.level === 2)
            isHomeTurf = true;

        if (isGlobalManager && !isHomeTurf) {
            return baseRoles.filter((role) => role.level > 10);
        }

        return baseRoles;
    };

    const addAssignment = () => {
        setData("assignments", [...assignments, { user_id: "", role_id: "" }]);
    };

    const removeAssignment = (index) => {
        setData(
            "assignments",
            assignments.filter((_, i) => i !== index),
        );
    };

    const updateAssignment = (index, field, value) => {
        const updated = assignments.map((assignment, i) => {
            if (i === index) {
                if (field === "user_id") {
                    return { ...assignment, user_id: value, role_id: "" };
                }
                return { ...assignment, [field]: value };
            }
            return assignment;
        });
        setData("assignments", updated);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Petugas</CardTitle>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAssignment}
                    className="flex items-center gap-2"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Tambah Pengguna</span>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {assignments.map((assignment, index) => {
                    const validRoles = getRolesForUser(assignment.user_id);

                    return (
                        <div key={index} className="flex items-start gap-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-grow">
                                <FormField
                                    error={
                                        errors[`assignments.${index}.user_id`]
                                    }
                                >
                                    <Select
                                        value={assignment.user_id}
                                        onValueChange={(val) =>
                                            updateAssignment(
                                                index,
                                                "user_id",
                                                val,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih pengguna..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allUsers.map((user) => (
                                                <SelectItem
                                                    key={user.id}
                                                    value={user.id.toString()}
                                                >
                                                    {user.name} ({user.global_role_code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>

                                <FormField
                                    error={
                                        errors[`assignments.${index}.role_id`]
                                    }
                                >
                                    <Select
                                        value={assignment.role_id}
                                        onValueChange={(val) =>
                                            updateAssignment(
                                                index,
                                                "role_id",
                                                val,
                                            )
                                        }
                                        disabled={!assignment.user_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jabatan..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {validRoles.length > 0 ? (
                                                validRoles.map((role) => (
                                                    <SelectItem
                                                        key={role.id}
                                                        value={role.id.toString()}
                                                    >
                                                        {role.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem
                                                    value="none"
                                                    disabled
                                                >
                                                    Tidak ada jabatan tersedia
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAssignment(index)}
                                className="text-destructive hover:text-destructive mt-1.5 shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
