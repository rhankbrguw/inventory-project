import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/Components/ui/card";
import FormField from "@/Components/FormField";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { Calendar } from "@/Components/ui/calendar";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function TransferDetailsManager({
    data,
    setData,
    errors,
    locations,
    isDetailsLocked,
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
                                <SelectValue placeholder="Pilih lokasi asal..." />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((loc) => (
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
                                <SelectValue placeholder="Pilih lokasi tujuan..." />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((loc) => (
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
                <FormField
                    label="Tanggal Transfer"
                    error={errors.transfer_date}
                >
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !data.transfer_date &&
                                        "text-muted-foreground"
                                )}
                                disabled={isDetailsLocked}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {data.transfer_date ? (
                                    formatDate(data.transfer_date)
                                ) : (
                                    <span>Pilih tanggal</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={data.transfer_date}
                                onSelect={(date) =>
                                    setData("transfer_date", date)
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </FormField>
                <FormField label="Catatan (Opsional)" error={errors.notes}>
                    <Textarea
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        disabled={isDetailsLocked}
                    />
                </FormField>
            </CardContent>
        </Card>
    );
}
