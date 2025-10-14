import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import FormField from "@/Components/FormField";
import { PlusCircle, Trash2 } from "lucide-react";

export default function AssignmentManager({
    assignments,
    allUsers,
    allRoles,
    errors,
    setData,
}) {
    const addAssignment = () => {
        setData("assignments", [...assignments, { user_id: "", role_id: "" }]);
    };

    const removeAssignment = (index) => {
        setData(
            "assignments",
            assignments.filter((_, i) => i !== index)
        );
    };

    const updateAssignment = (index, field, value) => {
        const updated = [...assignments];
        updated[index][field] = value;
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
                {assignments.map((assignment, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-grow">
                            <FormField
                                error={errors[`assignments.${index}.user_id`]}
                            >
                                <Select
                                    value={assignment.user_id}
                                    onValueChange={(value) =>
                                        updateAssignment(
                                            index,
                                            "user_id",
                                            value
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
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                            <FormField
                                error={errors[`assignments.${index}.role_id`]}
                            >
                                <Select
                                    value={assignment.role_id}
                                    onValueChange={(value) =>
                                        updateAssignment(
                                            index,
                                            "role_id",
                                            value
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allRoles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.id.toString()}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
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
                ))}
            </CardContent>
        </Card>
    );
}
