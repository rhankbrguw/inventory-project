export const transferDetailColumns = (t) => [
    {
        accessorKey: 'product.sku',
        header: 'SKU',
        className: 'whitespace-nowrap text-center px-4 w-[160px]',
        cell: ({ row }) => row.product?.sku || '-',
    },
    {
        accessorKey: 'product.name',
        header: t('ui.table.product_name'),
        className: 'whitespace-nowrap text-center px-4',
        cell: ({ row }) => row.product?.name || t('ui.deleted_product'),
    },
    {
        accessorKey: 'quantity',
        header: t('ui.table.qty'),
        className: 'whitespace-nowrap text-center px-4 w-[140px] tabular-nums',
        cell: ({ row }) => `${Math.abs(row.quantity)} ${row.product?.unit}`,
    },
];
