import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package, PackageX } from 'lucide-react';
import ReportMobileCard from './ReportMobileCard';
import { topProductsColumns } from '@/constants/tableColumns/productColumns';
import useTranslation from '@/hooks/useTranslation';

export default function TopProductsTable({ data }) {
    const { t } = useTranslation();
    const columns = topProductsColumns(t);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {t('ui.top_products')}
                </CardTitle>
                <CardDescription className="text-xs">
                    {t('ui.top_products_desc')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data &&
                data.length > 0 ? (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-xs text-muted-foreground bg-muted/30">
                                        {columns.map(
                                            (column, idx) => (
                                                <th
                                                    key={idx}
                                                    className={
                                                        column.headerClassName
                                                    }
                                                >
                                                    {column.header}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(
                                        (product, index) => (
                                            <tr
                                                key={index}
                                                className="border-b last:border-0 hover:bg-muted/10 transition-colors"
                                            >
                                                {columns.map(
                                                    (column, idx) => (
                                                        <td
                                                            key={idx}
                                                            className={
                                                                column.className
                                                            }
                                                        >
                                                            {column.cell
                                                                ? column.cell(
                                                                      {
                                                                          row: product,
                                                                          index,
                                                                      }
                                                                  )
                                                                : product[
                                                                      column
                                                                          .accessorKey
                                                                  ]}
                                                        </td>
                                                    )
                                                )}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden space-y-3">
                            {data.map(
                                (product, index) => (
                                    <ReportMobileCard
                                        key={product.id || index}
                                        product={product}
                                        rank={index + 1}
                                    />
                                )
                            )}
                        </div>
                    </>
                ) : (
                    <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                        <PackageX className="h-12 w-12 mb-2 opacity-20" />
                        <p className="text-sm">
                            {t('ui.no_sales_data')}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
