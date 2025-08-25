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
import { Edit, Trash2, Plus, MoreVertical } from 'lucide-react';
import Pagination from '@/Components/Pagination';

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
      title="Manajemen Pengguna"
    >
      <Head title="Manajemen Pengguna" />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Manajemen Pengguna</h1>
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

      <div className="bg-white rounded-lg shadow-md">
        <div className="md:hidden">
          {users.data.map((user) => (
            <div key={user.id} className="p-4 border-b last:border-b-0">
              <div className="flex justify-between items-center">
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-primary text-base">{user.name}</p>
                  <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                  <RoleBadge role={user.role} isMobile={true} />
                </div>
                <div className="ml-4">
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
                </div>
              </div>
            </div>
          ))}
        </div>

        <table className="min-w-full hidden md:table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.data.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination links={users.meta.links} />

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
