import React from "react";
import { Input } from "@/components/ui/input";
import { Search, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductCard from "./ProductCard";
import Pagination from "@/components/Pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PurchaseProductGrid({
    products,
    productTypes,
    params,
    setFilter,
    onProductClick,
    selectedProductIds,
    processingItem,
    paginationLinks,
    canPurchase = true,
}) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b flex-shrink-0">
                <h3 className="text-base font-semibold">Katalog Produk</h3>
                <div className="mt-2 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Cari produk (Nama atau SKU)..."
                            value={params.search || ""}
                            onChange={(e) =>
                                setFilter("search", e.target.value)
                            }
                            className="pl-9 h-9 text-sm"
                            disabled={!canPurchase}
                        />
                    </div>

                    {!canPurchase && (
                        <Alert variant="destructive">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertDescription>
                                Anda tidak memiliki izin untuk melakukan
                                pembelian. Silakan pilih lokasi yang sesuai
                                dengan peran Anda.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            {canPurchase ? (
                <div className="flex flex-col flex-1 overflow-hidden p-3">
                    <div className="flex-shrink-0 space-y-3 mb-4">
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth -mx-1 px-1">
                            <button
                                type="button"
                                onClick={() => setFilter("type_id", "all")}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border snap-start flex-shrink-0",
                                    params.type_id === "all" || !params.type_id
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
                                        "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border snap-start flex-shrink-0",
                                        params.type_id === type.id.toString()
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/30",
                                    )}
                                >
                                    {type.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto overscroll-contain pr-1 -mr-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={() => onProductClick(product)}
                                        selected={selectedProductIds.includes(
                                            product.id,
                                        )}
                                        processing={
                                            processingItem === product.id
                                        }
                                        showPrice={false}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                        <Search className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        Produk tidak ditemukan
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Coba kata kunci lain
                                    </p>
                                </div>
                            )}
                        </div>

                        {paginationLinks.length > 3 && (
                            <Pagination
                                links={paginationLinks}
                                className="pb-4"
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full flex-1 items-center justify-center p-6">
                    <ShieldAlert className="h-16 w-16 text-destructive/50" />
                    <p className="mt-4 text-sm font-semibold text-foreground">
                        Akses Ditolak
                    </p>
                    <p className="text-xs text-muted-foreground text-center max-w-sm">
                        Anda tidak memiliki izin untuk melakukan pembelian.
                        Pastikan lokasi yang dipilih sesuai dengan peran Anda.
                    </p>
                </div>
            )}
        </div>
    );
}
