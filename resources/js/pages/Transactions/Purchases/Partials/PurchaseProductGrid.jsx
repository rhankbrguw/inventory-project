import { Input } from '@/components/ui/input';
import {
    Search,
    ShieldAlert,
    PackageOpen,
    Warehouse,
    Cuboid,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import ProductCard from '../../Purchases/Partials/ProductCard';
import Pagination from '@/components/Pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

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
    selectedSourceType,
    selectedSourceId,
}) {
    const hasProducts = products.length > 0;
    const isInternalMode = selectedSourceType === 'internal';
    const isWarehouseSelected = isInternalMode && selectedSourceId;

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b flex-shrink-0">
                <h3 className="text-base font-semibold">Katalog Produk</h3>
                <div className="mt-2 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Cari produk (Nama atau SKU)..."
                            value={params.search || ''}
                            onChange={(e) =>
                                setFilter('search', e.target.value)
                            }
                            className="pl-9 h-9 text-sm"
                            disabled={
                                !canPurchase ||
                                (isInternalMode && !isWarehouseSelected)
                            }
                        />
                    </div>

                    {!canPurchase && (
                        <Alert variant="destructive">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertDescription>
                                Anda tidak memiliki izin untuk melakukan
                                pembelian.
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
                                onClick={() => setFilter('type_id', 'all')}
                                disabled={
                                    isInternalMode && !isWarehouseSelected
                                }
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border snap-start flex-shrink-0',
                                    params.type_id === 'all' || !params.type_id
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/30',
                                    isInternalMode &&
                                    !isWarehouseSelected &&
                                    'opacity-50 cursor-not-allowed'
                                )}
                            >
                                Semua
                            </button>
                            {productTypes.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() =>
                                        setFilter('type_id', type.id.toString())
                                    }
                                    disabled={
                                        isInternalMode && !isWarehouseSelected
                                    }
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border snap-start flex-shrink-0',
                                        params.type_id === type.id.toString()
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/30',
                                        isInternalMode &&
                                        !isWarehouseSelected &&
                                        'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    {type.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto overscroll-contain pr-1 -mr-3">
                        {isInternalMode && !isWarehouseSelected ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center h-full">
                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                    <Warehouse className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">
                                    Pilih Gudang Asal
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Pilih gudang terlebih dahulu untuk melihat
                                    produk yang tersedia
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
                                {hasProducts ? (
                                    products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="relative group isolate"
                                        >
                                            {isInternalMode && (
                                                <div className="absolute top-2 right-2 z-20 pointer-events-none">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-background/80 backdrop-blur-sm shadow-sm border border-border/50 text-[10px] h-6 px-2 gap-1.5 hover:bg-background/80"
                                                    >
                                                        <Cuboid className="w-3 h-3 text-muted-foreground" />
                                                        <span className="font-bold">
                                                            {formatNumber(
                                                                product.stock_quantity ||
                                                                0
                                                            )}
                                                        </span>
                                                        <span className="text-muted-foreground font-normal">
                                                            {product.unit}
                                                        </span>
                                                    </Badge>
                                                </div>
                                            )}

                                            <ProductCard
                                                product={product}
                                                onClick={() =>
                                                    onProductClick(product)
                                                }
                                                selected={selectedProductIds.includes(
                                                    product.id
                                                )}
                                                processing={
                                                    processingItem ===
                                                    product.id
                                                }
                                                showPrice={isInternalMode}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                            <PackageOpen className="w-8 h-8 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground mb-1">
                                            Produk tidak ditemukan
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {isInternalMode
                                                ? 'Tidak ada produk dengan stok di gudang ini'
                                                : 'Coba ubah filter supplier atau kata kunci pencarian'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {paginationLinks.length > 3 && hasProducts && (
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
                </div>
            )}
        </div>
    );
}
