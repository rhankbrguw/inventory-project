import { Badge } from "@/Components/ui/badge";
import {
    formatCurrency,
    formatDate,
    formatRelativeTime,
    formatGroupName,
    formatNumber,
} from "@/lib/utils";
import RoleBadge from "@/Components/RoleBadge";
import CustomerTypeBadge from "@/Components/CustomerTypeBadge";
import { Package, Warehouse } from "lucide-react";

const renderCell = (content, className = "") => (
    <div className={className}>{content}</div>
);

export const productColumns = [
    {
        accessorKey: "image_url",
        header: "Gambar",
        cell: ({ row }) =>
            renderCell(
                row.image_url ? (
                    <img
                        src={row.image_url}
                        alt={row.name}
                        className="h-12 w-12 rounded-md object-cover"
                    />
                ) : (
                    <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                ),
                "flex justify-center"
            ),
        className: "text-center",
    },
    {
        accessorKey: "name",
        header: "Nama Produk",
        cell: ({ row }) => row.name,
        className: "text-center font-medium",
    },
    {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => row.sku,
        className: "text-center font-mono",
    },
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

export const locationColumns = [
    {
        accessorKey: "name",
        header: "Nama Lokasi",
        cell: ({ row }) => row.name,
        className: "text-center font-medium",
    },
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
        cell: ({ row }) =>
            renderCell(
                <>
                    {row.location.type === "warehouse" ? (
                        <Warehouse className="w-4 h-4 mr-2 text-muted-foreground" />
                    ) : (
                        <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                    )}
                    {row.location.name}
                </>,
                "flex items-center justify-center"
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
        cell: ({ row }) => row.reference_code,
        className: "text-center font-mono text-xs whitespace-nowrap",
    },
    {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) =>
            renderCell(
                <Badge variant="secondary">{row.type}</Badge>,
                "flex justify-center"
            ),
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "location",
        header: "Lokasi",
        cell: ({ row }) => row.location,
        className: "text-center whitespace-nowrap",
    },
    {
        accessorKey: "supplier",
        header: "Supplier",
        cell: ({ row }) => row.supplier,
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
        cell: ({ row }) => row.user,
        className: "text-center whitespace-nowrap",
    },
];

export const supplierColumns = [
    {
        accessorKey: "name",
        header: "Nama Supplier",
        cell: ({ row }) => row.name,
        className: "text-center font-medium",
    },
    {
        accessorKey: "contact_person",
        header: "Koordinator",
        cell: ({ row }) => row.contact_person,
        className: "text-center",
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.email,
        className: "text-center text-muted-foreground",
    },
    {
        accessorKey: "phone",
        header: "Telepon",
        cell: ({ row }) => row.phone,
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
        cell: ({ row }) => <CustomerTypeBadge type={row.type} />,
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
