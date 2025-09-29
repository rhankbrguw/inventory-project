import { Badge } from "@/Components/ui/badge";
import {
    formatCurrency,
    formatDate,
    formatRelativeTime,
    formatGroupName,
    formatNumber,
} from "@/lib/utils";
import RoleBadge from "@/Components/RoleBadge";
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
        accessorKey: "created_at",
        header: "Tgl. Dibuat",
        cell: ({ row }) => formatDate(row.created_at),
        className: "text-center",
    },
    {
        accessorKey: "price",
        header: "Harga",
        cell: ({ row }) => formatCurrency(row.price),
        className: "text-center font-semibold",
    },
];

export const stockColumns = [
    {
        accessorKey: "product.name",
        header: "Nama Item",
        cell: ({ row }) => row.product.name,
        className: "text-center font-medium",
    },
    {
        accessorKey: "product.sku",
        header: "SKU",
        cell: ({ row }) => row.product.sku,
        className: "text-center font-mono",
    },
    {
        accessorKey: "location.name",
        header: "Lokasi",
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                {row.location.type === "warehouse" ? (
                    <Warehouse className="w-4 h-4 mr-2 text-muted-foreground" />
                ) : (
                    <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                )}
                {row.location.name}
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
        cell: ({ row }) => `${formatNumber(row.quantity)} ${row.product.unit}`,
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

export const supplierColumns = [
    {
        accessorKey: "name",
        header: "Nama Supplier",
        className: "text-center font-medium",
    },
    {
        accessorKey: "contact_person",
        header: "Koordinator",
        className: "text-center",
    },
    {
        accessorKey: "email",
        header: "Email",
        className: "text-center text-muted-foreground",
    },
    { accessorKey: "phone", header: "Telepon", className: "text-center" },
];

export const userColumns = [
    {
        accessorKey: "name",
        header: "Nama",
        className: "text-center font-medium",
    },
    {
        accessorKey: "email",
        header: "Email",
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
        cell: ({ row }) => <RoleBadge role={row.role} />,
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
    { accessorKey: "name", header: "Nama", className: "text-center" },
    {
        accessorKey: "code",
        header: "Kode",
        cell: ({ row }) => <span className="font-mono">{row.code || "-"}</span>,
        className: "text-center",
    },
];

export const locationColumns = [
    {
        accessorKey: "name",
        header: "Nama Lokasi",
        className: "font-medium",
    },
    {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => (
            <span className="capitalize">{row.original.type}</span>
        ),
    },
    {
        accessorKey: "address",
        header: "Alamat",
        cell: ({ row }) => row.original.address || "-",
    },
];
