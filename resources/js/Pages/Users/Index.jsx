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
import { Button } from '@/Components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import Pagination from '@/Components/Pagination';

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
      title="User Management"
    >
      <Head title="User Management" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
            <h1 className="text-2xl font-bold text-primary">Manajemen Pengguna</h1>
            <Link href={route('users.create')}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah Pengguna</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* mobile view */}
            <div className="md:hidden">
              {users.data.map((user) => (
                <div key={user.id} className="p-4 border-b last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-bold text-primary text-base mb-1">{user.name}</p>
                      <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                      <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-primary text-white">
                        {user.role}
                      </span>
                    </div>
                    <div className="flex space-x-1 ml-4">
                      <Link href={route('users.edit', user.id)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => setConfirmingUserDeletion(user.id)}
                        disabled={user.id === auth.user.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* desktop view */}
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary/20 text-primary">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
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
        </div>
      </div>

      <AlertDialog open={confirmingUserDeletion !== null} onOpenChange={() => setConfirmingUserDeletion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Mohon Konfirmasi kembali untuk menghapus pengguna ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthenticatedLayout>
  );
}
