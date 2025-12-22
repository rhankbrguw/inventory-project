import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import FormField from "@/components/FormField";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function TransferDetailsManager({
    data,
    setData,
    errors,
    sourceLocations,
    destinationLocations,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Detail Transfer</CardTitle>
                <CardDescription>
                    Pilih lokasi asal, lokasi tujuan, dan detail transfer
                    lainnya.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label="Dari Lokasi (Asal)"
                        error={errors.from_location_id}
                    >
                        <Select
                            value={data.from_location_id}
                            onValueChange={(value) =>
                                setData("from_location_id", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Lokasi Asal" />
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
                        label="Ke Lokasi (Tujuan)"
                        error={errors.to_location_id}
                    >
                        <Select
                            value={data.to_location_id}
                            onValueChange={(value) =>
                                setData("to_location_id", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Lokasi Tujuan" />
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
                <FormField label="Catatan (Opsional)" error={errors.notes}>
                    <Textarea
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        placeholder="Keterangan transfer..."
                    />
                </FormField>
            </CardContent>
        </Card>
    );
}
