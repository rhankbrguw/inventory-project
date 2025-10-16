import { Badge } from "@/Components/ui/badge";
import {
    formatCurrency,
    formatDate,
    formatRelativeTime,
    formatGroupName,
    formatNumber,
    formatTime,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import UnifiedBadge from "@/Components/UnifiedBadge";
import { Link } from "@inertiajs/react";
import { Package, Warehouse } from "lucide-react";

export const productColumns = [
    {
        accessorKey: "image_url",
        header: "Gambar",
        cell: ({ row }) => (
            <div className="flex justify-center">
                {row.image_url ? (
                    <img
                        src={row.image_url}
                        alt={row.name}
                        className="h-12 w-12 rounded-md object-cover"
                    />
                ) : (
                    <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                )}
            </div>
        ),
        className: "text-center",
    },
    {
        accessorKey: "name",
        header: "Nama Produk",
        className: "text-center font-medium",
    },
    { accessorKey: "sku", header: "SKU", className: "text-center font-mono" },
    {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => row.type?.name || "-",
        className: "text-center",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.deleted_at ? "destructive" : "success"}>
                {row.deleted_at ? "Nonaktif" : "Aktif"}
            </Badge>
        ),
        className: "text-center",
    },
    {
        accessorKey: "price",
        header: "Harga",
        cell: ({ row }) => formatCurrency(row.price),
        className: "text-center font-semibold",
    },
];

export const locationColumns = [
    {
        accessorKey: "name",
        header: "Nama Lokasi",
        className: "font-medium text-center",
    },
    {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => row.type?.name || "-",
        className: "text-center",
    },
    {
        accessorKey: "users",
        header: "Petugas",
        cell: ({ row }) =>
            row.users.length > 0
                ? row.users.map((user) => user.name).join(", ")
                : "-",
        className: "text-center",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.deleted_at ? "destructive" : "success"}>
                {row.deleted_at ? "Nonaktif" : "Aktif"}
            </Badge>
        ),
        className: "text-center",
    },
];

export const stockColumns = [
    {
        accessorKey: "product.name",
        header: "Nama Item",
        cell: ({ row }) => row.product?.name || "Produk Dihapus",
        className: "text-center font-medium",
    },
    {
        accessorKey: "product.sku",
        header: "SKU",
        cell: ({ row }) => row.product?.sku || "-",
        className: "text-center font-mono",
    },
    {
        accessorKey: "location.name",
        header: "Lokasi",
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                {row.location?.type === "warehouse" ? (
                    <Warehouse className="w-4 h-4 mr-2 text-muted-foreground" />
                ) : (
                    <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                )}
                {row.location?.name || "Lokasi Dihapus"}
            </div>
        ),
        className: "text-center",
    },
    {
        accessorKey: "updated_at",
        header: "Aktivitas Terakhir",
        cell: ({ row }) => formatRelativeTime(row.updated_at),
        className: "text-center",
    },
    {
        accessorKey: "quantity",
        header: "Kuantitas",
        cell: ({ row }) =>
            `${formatNumber(row.quantity)} ${row.product?.unit || ""}`,
        className: "text-center font-semibold",
    },
];

export const transactionColumns = [
    {
        accessorKey: "reference_code",
        header: "Referensi",
        className: "text-center font-mono text-xs whitespace-nowrap",
    },
    {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Badge variant="secondary">{row.type}</Badge>
            </div>
        ),
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "location",
        header: "Lokasi",
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "supplier",
        header: "Supplier",
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "transaction_date",
        header: "Tanggal",
        cell: ({ row }) => formatDate(row.transaction_date),
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "total_cost",
        header: "Total",
        cell: ({ row }) => formatCurrency(row.total_cost),
        className: "text-center font-semibold whitespace-nowrap",
    },
    {
        accessorKey: "user",
        header: "PIC",
        className: "text-center whitespace-nowrap",
    },
];

export const stockMovementPreviewColumns = [
    {
        accessorKey: "created_at_time",
        header: "Waktu",
        cell: ({ row }) => (
            <div>
                <div>{formatDate(row.created_at)}</div>
                <div className="text-muted-foreground">
                    {formatTime(row.created_at)}
                </div>
            </div>
        ),
        className: "text-xs text-center whitespace-nowrap",
    },
    {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.type}
            </Badge>
        ),
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "reference",
        header: "Referensi / Catatan",
        cell: ({ row }) =>
            row.reference ? (
                <Link
                    href={row.reference.url}
                    className="text-primary hover:underline"
                >
                    {row.reference.code}
                </Link>
            ) : (
                row.notes || "-"
            ),
        className: "font-mono text-center text-xs whitespace-nowrap",
    },
    {
        accessorKey: "quantity",
        header: "Perubahan",
        cell: ({ row }) => (
            <span
                className={
                    row.quantity > 0 ? "text-success" : "text-destructive"
                }
            >
                {row.quantity > 0 ? "+" : ""}
                {formatNumber(row.quantity)}
            </span>
        ),
        className: "text-center font-semibold whitespace-nowrap",
    },
];

export const stockMovementColumns = [
    {
        accessorKey: "product.name",
        header: "Produk",
        cell: ({ row }) => row.product?.name,
        className: "font-medium text-center whitespace-nowrap",
    },
    {
        accessorKey: "product.sku",
        header: "SKU",
        cell: ({ row }) => row.product?.sku,
        className: "font-mono text-center text-xs whitespace-nowrap",
    },
    {
        accessorKey: "location.name",
        header: "Lokasi",
        cell: ({ row }) => row.location?.name,
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.type}
            </Badge>
        ),
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "reference",
        header: "Referensi / Catatan",
        cell: ({ row }) =>
            row.reference ? (
                <Link
                    href={row.reference.url}
                    className="text-primary hover:underline"
                >
                    {row.reference.code}
                </Link>
            ) : (
                row.notes || "-"
            ),
        className: "font-mono text-center text-xs whitespace-nowrap",
    },
    {
        accessorKey: "quantity",
        header: "Perubahan",
        cell: ({ row }) => (
            <span
                className={
                    row.quantity > 0 ? "text-success" : "text-destructive"
                }
            >
                {row.quantity > 0 ? "+" : ""}
                {formatNumber(row.quantity)}
            </span>
        ),
        className: "font-semibold text-center whitespace-nowrap",
    },
    {
        accessorKey: "created_at",
        header: "Waktu",
        cell: ({ row }) => (
            <div>
                <div>{formatDate(row.created_at)}</div>
                <div className="text-muted-foreground">
                    {formatTime(row.created_at)}
                </div>
            </div>
        ),
        className: "text-xs text-center whitespace-nowrap",
    },
];

export const purchaseDetailColumns = [
    {
        accessorKey: "product.name",
        header: "Produk",
        cell: ({ row }) => (
            <div
                className={cn(
                    row.product?.deleted_at && "text-muted-foreground"
                )}
            >
                {row.product?.name || "Produk Telah Dihapus"}
                {row.product?.deleted_at && (
                    <span className="ml-2 text-xs text-destructive">
                        (Nonaktif)
                    </span>
                )}
            </div>
        ),
        className: "font-medium text-center",
    },
    {
        accessorKey: "product.sku",
        header: "SKU",
        cell: ({ row }) => row.product?.sku || "-",
        className: "font-mono text-xs text-center",
    },
    {
        accessorKey: "quantity",
        header: "Jumlah",
        cell: ({ row }) =>
            `${formatNumber(row.quantity)} ${row.product?.unit || ""}`,
        className: "text-center",
    },
    {
        accessorKey: "cost_per_unit",
        header: "Harga Beli",
        cell: ({ row }) => formatCurrency(row.cost_per_unit),
        className: "text-center",
    },
    {
        accessorKey: "subtotal",
        header: "Subtotal",
        cell: ({ row }) => formatCurrency(row.quantity * row.cost_per_unit),
        className: "text-center font-semibold",
    },
];

export const supplierColumns = [
    {
        accessorKey: "name",
        header: "Nama Supplier",
        className: "text-center font-medium whitespace-nowrap",
    },
    {
        accessorKey: "contact_person",
        header: "Koordinator",
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "email",
        header: "Email",
        className: "text-center text-muted-foreground whitespace-nowrap",
    },
    {
        accessorKey: "phone",
        header: "Telepon",
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.deleted_at ? "destructive" : "success"}>
                {row.deleted_at ? "Nonaktif" : "Aktif"}
            </Badge>
        ),
        className: "text-center",
    },
];

export const customerColumns = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => row.id,
        className: "text-center",
    },
    {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => row.name,
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => <UnifiedBadge text={row.type?.name} />,
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.email,
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "phone",
        header: "Telepon",
        cell: ({ row }) => row.phone || "-",
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "created_at",
        header: "Tgl. Dibuat",
        cell: ({ row }) => formatDate(row.created_at),
        className: "text-center whitespace-nowrap",
    },
];

export const userColumns = [
    {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => row.name,
        className: "text-center font-medium",
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.email,
        className: "text-center text-muted-foreground",
    },
    {
        accessorKey: "role.code",
        header: "Kode",
        cell: ({ row }) => (
            <span className="font-mono">{row.role?.code || "-"}</span>
        ),
        className: "text-center",
    },
    {
        accessorKey: "role",
        header: "Jabatan",
        cell: ({ row }) => <UnifiedBadge text={row.role?.name} />,
        className: "text-center",
    },
];

export const typeColumns = [
    {
        accessorKey: "group",
        header: "Grup",
        cell: ({ row }) => formatGroupName(row.group),
        className: "text-center font-medium",
    },
    {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => row.name,
        className: "text-center",
    },
    {
        accessorKey: "code",
        header: "Kode",
        cell: ({ row }) => <span className="font-mono">{row.code || "-"}</span>,
        className: "text-center",
    },
];
