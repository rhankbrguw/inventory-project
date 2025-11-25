import { Card, CardContent } from "@/components/ui/card";
import { MapPinOff } from "lucide-react";

export default function NoLocationAssigned() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] p-4">
            <Card className="w-full max-w-md bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="p-4 rounded-full bg-muted">
                        <MapPinOff className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">
                            Tidak Ada Lokasi Ditugaskan
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            Akun Anda saat ini belum ditempatkan di lokasi
                            (Cabang/Gudang) manapun.
                        </p>
                    </div>
                    <div className="text-xs text-muted-foreground bg-background px-3 py-2 rounded border">
                        Silakan hubungi{" "}
                        <span className="font-medium text-foreground">
                            Super Admin
                        </span>{" "}
                        untuk penugasan lokasi.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
