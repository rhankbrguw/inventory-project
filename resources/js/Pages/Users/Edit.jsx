import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import InputError from '@/Components/InputError';

export default function Edit({ auth, user, roles }) {
  const { data, setData, patch, processing, errors } = useForm({
    name: user.data.name || '',
    email: user.data.email || '',
    role: user.data.role || '',
  });

  const submit = (e) => {
    e.preventDefault();

    patch(route('users.update', { user: user.data.id }), {
      preserveScroll: true,
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      title={`Edit User: ${user.data.name}`}
    >
      <Head title={`Edit User: ${user.data.name}`} />

      <div className="py-8">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-primary mb-6">Edit Pengguna</h1>

            <form onSubmit={submit} className="space-y-6">
              <div>
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="mt-1 block w-full"
                />
                <InputError message={errors.name} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="mt-1 block w-full"
                />
                <InputError message={errors.email} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="role">Jabatan</Label>
                <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((roleName) => (
                      <SelectItem key={roleName} value={roleName}>
                        {roleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={errors.role} className="mt-2" />
              </div>

              <div className="flex items-center gap-4">
                <Button disabled={processing}>Simpan Perubahan</Button>
                <Link href={route('users.index')}>
                  <Button type="button" variant="outline">Batal</Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
