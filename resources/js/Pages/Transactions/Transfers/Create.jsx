import { Link, useForm } from "@inertiajs/react";
import ContentPageLayout from "@/Components/ContentPageLayout";
import TransferItemManager from "../Partials/TransferItemManager";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { Textarea } from "@/Components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import { format } from "date-fns";

export default function Create({ auth, locations, products }) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        from_location_id: "",
        to_location_id: "",
        transfer_date: new Date(),
        notes: "",
        items: [{ product_id: "", quantity: 1, unit: "" }],
    });

    const selectedProductIds = data.items
        .map((item) => item.product_id)
        .filter(Boolean);

    const submit = (e) => {
        e.preventDefault();
        post(route("transactions.transfers.store"), {
            transform: (data) => ({
                ...data,
                transfer_date: format(data.transfer_date, "yyyy-MM-dd"),
            }),
        });
    };

    return (
        <ContentPageLayout
            auth={auth}
            title="Buat Transfer Stok"
            backRoute="transactions.index"
        >
            <form onSubmit={submit} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Transfer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Dari Lokasi"
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
                                label="Ke Lokasi"
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
                        <FormField
                            label="Catatan (Opsional)"
                            error={errors.notes}
                        >
                            <Textarea
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                            />
                        </FormField>
                    </CardContent>
                </Card>

                <TransferItemManager
                    items={data.items}
                    setData={setData}
                    products={products}
                    errors={errors}
                    selectedProductIds={selectedProductIds}
                    fromLocationId={data.from_location_id}
                />

                <div className="flex justify-end gap-2">
                    <Link href={route("transactions.index")}>
                        <Button variant="outline" type="button">
                            Batal
                        </Button>
                    </Link>
                    <Button disabled={processing || !isDirty}>
                        Simpan Transfer
                    </Button>
                </div>
            </form>
        </ContentPageLayout>
    );
}
