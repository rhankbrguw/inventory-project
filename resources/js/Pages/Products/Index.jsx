import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import Pagination from "@/Components/Pagination";
import { Button } from "@/Components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Plus, MoreVertical } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";

export default function Index({ auth, products }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            Manajemen Produk
          </h1>
          <Link href={route("products.create")}>
            <Button size="icon" className="sm:hidden rounded-full h-10 w-10">
              <Plus className="h-5 w-5" />
            </Button>
            <Button className="hidden sm:flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Tambah Produk</span>
            </Button>
          </Link>
        </div>
      }
    >
      <Head title="Produk" />

      <div className="space-y-4">
        <div className="md:hidden space-y-4">
          {products.data.map((product) => (
            <Card key={product.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {product.name}
                </CardTitle>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  SKU: {product.sku}
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(product.price)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Stok: {product.stock_quantity} {product.unit}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="hidden md:block bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.data.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell>
                    {product.stock_quantity} {product.unit}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Pagination links={products.meta.links} />
      </div>
    </AuthenticatedLayout>
  );
}
