import { Badge } from "@/Components/ui/badge";
import {
    formatCurrency,
    formatDate,
    formatRelativeTime,
    formatGroupName,
} from "@/lib/utils";
import RoleBadge from "@/Components/RoleBadge";

const renderProductName = (item) => (
    <div>
        <p className="font-medium">{item.product.name}</p>
        <p className="text-xs text-muted-foreground font-mono">
            {item.product.sku}
        </p>
    </div>
);

export const productColumns = [
    { accessorKey: "image_url", header: "Gambar" },
    { accessorKey: "name", header: "Nama Produk" },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "type.name", header: "Tipe" },
    {
        accessorKey: "created_at",
        header: "Tgl. Dibuat",
        cell: ({ row }) => formatDate(row.created_at),
    },
    {
        accessorKey: "price",
        header: "Harga",
        cell: ({ row }) => formatCurrency(row.price),
    },
];

export const stockColumns = [
    {
        accessorKey: "product",
        header: "Nama Item",
        cell: ({ row }) => renderProductName(row),
    },
    { accessorKey: "location.name", header: "Lokasi" },
    {
        accessorKey: "updated_at",
        header: "Aktivitas Terakhir",
        cell: ({ row }) => formatRelativeTime(row.updated_at),
    },
    {
        accessorKey: "quantity",
        header: "Kuantitas",
        cell: ({ row }) =>
            `${parseFloat(row.quantity).toLocaleString("id-ID")} ${
                row.product.unit
            }`,
    },
];

export const transactionColumns = [
    { accessorKey: "reference_code", header: "Referensi" },
    {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => <Badge variant="secondary">{row.type}</Badge>,
    },
    { accessorKey: "location", header: "Lokasi" },
    { accessorKey: "supplier", header: "Pihak Terkait" },
    {
        accessorKey: "transaction_date",
        header: "Tanggal",
        cell: ({ row }) => formatDate(row.transaction_date),
    },
    {
        accessorKey: "total_cost",
        header: "Total",
        cell: ({ row }) => formatCurrency(row.total_cost),
    },
    { accessorKey: "user", header: "PIC" },
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
