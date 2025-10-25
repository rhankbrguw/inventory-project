import { Link, useForm, Head } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import PurchaseItemManager from "../Partials/PurchaseItemManager";
import TransactionDetailsManager from "../Partials/PurchaseDetailsManager";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

function ProductCard({ product, onClick, selected }) {
    const imageUrl = product.image_path
        ? `/storage/${product.image_path}`
        : "https://via.placeholder.com/150";

    return (
        <div
            onClick={onClick}
            className={cn(
                "group cursor-pointer rounded-lg border bg-white overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5",
                selected
                    ? "ring-2 ring-primary border-primary shadow-md"
                    : "border-gray-200 hover:border-primary/50",
            )}
        >
            <div className="aspect-square w-full bg-gradient-to-br from-muted/30 to-muted/10 relative overflow-hidden">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {selected && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary shadow-lg flex items-center justify-center animate-in zoom-in duration-200">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-2 space-y-0.5 bg-white">
                <p className="font-semibold text-xs leading-tight line-clamp-1 text-gray-900">
                    {product.name}
                </p>
                <p className="text-[10px] text-gray-500 font-mono leading-tight">
                    {product.sku}
                </p>
                <p className="text-sm font-bold text-primary pt-0.5">
                    {formatCurrency(product.price)}
                </p>
            </div>
        </div>
    );
}

export default function Create({
    auth,
    locations,
    suppliers,
    products,
    paymentMethods,
    productTypes = [],
}) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        location_id: "",
        supplier_id: "",
        transaction_date: new Date(),
        notes: "",
        payment_method_type_id: "",
        items: [],
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [cartOpen, setCartOpen] = useState(false);

    const selectedProductIds = data.items
        .map((item) => item.product_id)
        .filter(Boolean);

    const filteredProducts = products.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType =
            selectedType === "all" || p.type_id?.toString() === selectedType;
        return matchesSearch && matchesType;
    });

    const addItem = (product) => {
        if (selectedProductIds.includes(product.id)) return;

        const firstItemSupplier =
            data.items.length > 0 ? data.items[0].supplier_id : null;

        setData("items", [
            ...data.items,
            {
                product_id: product.id,
                name: product.name,
                unit: product.unit,
                supplier_id:
                    product.default_supplier?.id?.toString() ||
                    firstItemSupplier,
                quantity: 1,
                cost_per_unit: product.price || "",
            },
        ]);

        if (data.items.length === 0) {
            const supplierToSet =
                product.default_supplier?.id?.toString() || null;
            if (supplierToSet) setData("supplier_id", supplierToSet);
        }
    };

    const removeItem = (index) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData("items", newItems);
        if (newItems.length === 0) setData("supplier_id", "");
    };

    const handleItemChange = (index, field, value) => {
        let updatedItems = [...data.items];
        updatedItems[index][field] = value;

        if (index === 0 && field === "supplier_id") {
            setData("supplier_id", value);
            updatedItems = updatedItems.map((item, i) =>
                i > 0 ? { ...item, supplier_id: value } : item,
            );
        }
        setData("items", updatedItems);
    };

    const calculateTotal = () =>
        data.items.reduce(
            (total, item) =>
                total + Number(item.quantity) * Number(item.cost_per_unit),
            0,
        );

    const submit = (e) => {
        e.preventDefault();
        post(route("transactions.purchases.store"), {
            transform: (data) => ({
                ...data,
                transaction_date: format(data.transaction_date, "yyyy-MM-dd"),
            }),
        });
    };

    const isDetailsLocked = data.items.length === 0;

    const CartContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
                <TransactionDetailsManager
                    data={data}
                    setData={setData}
                    errors={errors}
                    locations={locations}
                    suppliers={suppliers}
                    paymentMethods={paymentMethods}
                    isDetailsLocked={isDetailsLocked}
                />

                <PurchaseItemManager
                    items={data.items}
                    suppliers={suppliers}
                    handleItemChange={handleItemChange}
                    removeItem={removeItem}
                    errors={errors}
                />
            </div>

            <div className="flex-shrink-0 border-t-2 bg-gradient-to-b from-white to-muted/20 px-4 py-3 space-y-2.5">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] text-muted-foreground font-medium mb-0.5">
                            Total Pembelian
                        </p>
                        <p className="text-2xl font-bold tracking-tight text-gray-900">
                            {formatCurrency(calculateTotal())}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={route("transactions.index")} className="flex-1">
                        <Button
                            variant="outline"
                            type="button"
                            className="w-full h-9 text-sm font-semibold border-2 hover:bg-muted"
                        >
                            Batal
                        </Button>
                    </Link>
                    <Button
                        onClick={submit}
                        className="flex-1 h-9 text-sm font-semibold shadow-sm hover:shadow transition-all"
                        disabled={processing || !isDirty || isDetailsLocked}
                    >
                        {processing ? "Menyimpan..." : "Simpan"}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Buat Pembelian Barang" />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] xl:grid-cols-[1fr,420px] gap-4 h-[calc(100vh-7rem)]">
                <div className="flex flex-col min-h-0">
                    <div className="flex-shrink-0 space-y-2 mb-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 text-sm border-2 focus-visible:ring-2"
                            />
                        </div>

                        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
                            <button
                                type="button"
                                onClick={() => setSelectedType("all")}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border-2",
                                    selectedType === "all"
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-gray-50",
                                )}
                            >
                                Semua
                            </button>
                            {productTypes.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() =>
                                        setSelectedType(type.id.toString())
                                    }
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border-2",
                                        selectedType === type.id.toString()
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                            : "bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-gray-50",
                                    )}
                                >
                                    {type.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto overscroll-contain">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 pb-2">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={() => addItem(product)}
                                        selected={selectedProductIds.includes(
                                            product.id,
                                        )}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                        <Search className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        Produk tidak ditemukan
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Coba kata kunci lain
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                        <SheetTrigger asChild>
                            <Button
                                className="lg:hidden fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50"
                                size="icon"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {data.items.length > 0 && (
                                    <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-white text-xs font-bold flex items-center justify-center">
                                        {data.items.length}
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-full sm:max-w-md p-0"
                        >
                            <SheetHeader className="px-4 py-3 border-b">
                                <SheetTitle>Keranjang Pembelian</SheetTitle>
                            </SheetHeader>
                            <CartContent />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="hidden lg:flex flex-col min-h-0 bg-white border-2 rounded-xl shadow-sm">
                    <CartContent />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
