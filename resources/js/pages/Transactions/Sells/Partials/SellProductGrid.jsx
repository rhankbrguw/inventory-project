import React from "react";
import { Input } from "@/components/ui/input";
import { Search, PackageOpen, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductCard from "../../Purchases/Partials/ProductCard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Pagination from "@/components/Pagination";

export default function SellProductGrid({
    locations,
    onLocationChange,
    products,
    productTypes,
    params,
    setFilter,
    onProductClick,
    selectedProductIds,
    processingItem,
    paginationLinks,
}) {
    const selectedLocationId = params.location_id || "";
    const searchQuery = params.search || "";
    const selectedType = params.type_id || "all";

    const selectedLocation = locations.find(
        (loc) => loc.id.toString() === selectedLocationId,
    );

    const canSellAtLocation = selectedLocation?.can_sell ?? false;
    const roleAtLocation = selectedLocation?.role_at_location;

    const getRoleDisplayName = (code) => {
        const roleNames = {
            WHM: "Warehouse Manager",
            BRM: "Branch Manager",
            CSH: "Cashier",
            STF: "Staff",
        };
        return roleNames[code] || code;
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-3 border-b flex-shrink-0">
                <h3 className="text-base font-semibold">Katalog Produk</h3>
                <div className="mt-2 space-y-2">
                    <Label htmlFor="location_id">Lokasi Penjualan</Label>
                    <Select
                        value={selectedLocationId}
                        onValueChange={onLocationChange}
                    >
                        <SelectTrigger id="location_id" className="h-9 text-xs">
                            <SelectValue placeholder="Pilih Lokasi Penjualan untuk Memulai" />
                        </SelectTrigger>
                        <SelectContent>
                            {locations.map((loc) => (
                                <SelectItem
                                    key={loc.id}
                                    value={loc.id.toString()}
                                    disabled={!loc.can_sell}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{loc.name}</span>
                                        {!loc.can_sell && (
                                            <span className="text-xs text-muted-foreground">
                                                (
                                                {getRoleDisplayName(
                                                    loc.role_at_location,
                                                )}{" "}
                                                - Tidak dapat menjual)
                                            </span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedLocation && !canSellAtLocation && (
                        <Alert variant="destructive" className="mt-2">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertDescription>
                                Anda tidak memiliki izin untuk menjual di lokasi
                                ini. Peran Anda:{" "}
                                <strong>
                                    {getRoleDisplayName(roleAtLocation)}
                                </strong>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            {!selectedLocationId && (
                <div className="flex flex-col h-full flex-1 items-center justify-center">
                    <PackageOpen className="h-16 w-16 text-muted-foreground/50" />
                    <p className="mt-4 text-sm font-semibold text-muted-foreground">
                        Pilih lokasi penjualan
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Katalog produk akan tampil setelah lokasi dipilih.
                    </p>
                </div>
            )}

            {selectedLocationId && !canSellAtLocation && (
                <div className="flex flex-col h-full flex-1 items-center justify-center p-6">
                    <ShieldAlert className="h-16 w-16 text-destructive/50" />
                    <p className="mt-4 text-sm font-semibold text-foreground">
                        Akses Ditolak
                    </p>
                    <p className="text-xs text-muted-foreground text-center max-w-sm">
                        Anda tidak memiliki izin untuk melakukan penjualan di
                        lokasi ini. Peran Anda di sini adalah{" "}
                        <strong>{getRoleDisplayName(roleAtLocation)}</strong>.
                    </p>
                </div>
            )}

            {selectedLocationId && canSellAtLocation && (
                <div className="flex flex-col flex-1 overflow-hidden p-3">
                    <div className="flex-shrink-0 space-y-3 mb-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari produk (Nama atau SKU)..."
                                value={searchQuery}
                                onChange={(e) =>
                                    setFilter("search", e.target.value)
                                }
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth -mx-1 px-1">
                            <button
                                type="button"
                                onClick={() => setFilter("type_id", "all")}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border",
                                    selectedType === "all"
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/30",
                                )}
                            >
                                Semua
                            </button>
                            {productTypes.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() =>
                                        setFilter("type_id", type.id.toString())
                                    }
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border",
                                        selectedType === type.id.toString()
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/30",
                                    )}
                                >
                                    {type.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto overscroll-contain pr-1 -mr-3 flex flex-col justify-between">
                        <div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onClick={() =>
                                                onProductClick(product)
                                            }
                                            selected={selectedProductIds.includes(
                                                product.id,
                                            )}
                                            processing={
                                                processingItem === product.id
                                            }
                                            showPrice={true}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                        <Search className="w-16 h-16 text-muted-foreground/50 mb-3" />
                                        <p className="text-sm font-medium text-foreground mb-1">
                                            Produk tidak ditemukan
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Coba kata kunci atau filter lain.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {paginationLinks.length > 3 && (
                            <Pagination
                                links={paginationLinks}
                                className="mt-6"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
