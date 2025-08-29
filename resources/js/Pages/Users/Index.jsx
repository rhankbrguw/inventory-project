import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from '@/Components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Edit, Trash2, Plus, MoreVertical } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";

const RoleBadge = ({ role, isMobile = false }) => {
  const baseStyle = 'px-3 py-1 text-xs font-bold rounded-full inline-block';

  const mobileColors = {
    'Super Admin': 'bg-primary text-white',
    'Finance': 'bg-green-500 text-white',
    'Branch Manager': 'bg-blue-500 text-white',
    'Cashier': 'bg-gray-500 text-white',
  };

  const desktopStyle = 'bg-secondary/20 text-primary';
  const style = isMobile ? (mobileColors[role] || 'bg-gray-400 text-white') : desktopStyle;

  return <span className={`${baseStyle} ${style}`}>{role}</span>;
};

export default function Index({ auth, users }) {
  const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(null);

  const deleteUser = () => {
    router.delete(route('users.destroy', confirmingUserDeletion), {
      preserveScroll: true,
      onSuccess: () => setConfirmingUserDeletion(null),
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            Manajemen Pengguna
          </h1>
          <Link href={route('users.create')}>
            <Button size="icon" className="sm:hidden rounded-full h-10 w-10">
              <Plus className="h-5 w-5" />
            </Button>
            <Button className="hidden sm:flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Tambah Pengguna</span>
            </Button>
          </Link>
        </div>
      }
    >
      <Head title="Manajemen Pengguna" />

      <div className="space-y-4">
        <div className="md:hidden space-y-4">
          {users.data.map((user) => (
            <Card key={user.id}>
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
                <CardTitle className="text-base font-bold text-primary">
                  {user.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical className="h-5 w-5 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href={route('users.edit', user.id)}>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <Edit className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={() => setConfirmingUserDeletion(user.id)}
                      disabled={user.id === auth.user.id}
                    >
                      <Trash2 className="h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4">
                <div className="text-sm text-gray-500 mb-2">
                  {user.email}
                </div>
                <RoleBadge role={user.role} isMobile={true} />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="hidden md:block bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Email</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-center font-medium text-gray-900">{user.name}</TableCell>
                  <TableCell className="text-center text-gray-500">{user.email}</TableCell>
                  <TableCell className="text-center">
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <Link href={route('users.edit', user.id)}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setConfirmingUserDeletion(user.id)}
                        disabled={user.id === auth.user.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Pagination links={users.meta.links} />
      </div>

      <AlertDialog open={confirmingUserDeletion !== null} onOpenChange={() => setConfirmingUserDeletion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun pengguna secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} className="bg-red-600 hover:bg-red-700">Hapus Pengguna</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthenticatedLayout>
  );
}
