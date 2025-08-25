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

export default function Create({ auth, roles }) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('users.store'));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      title="Create New User"
    >
      <Head title="Create New User" />

      <div className="py-8">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-primary mb-6">Buat Pengguna Baru</h1>

            <form onSubmit={submit} className="space-y-6">
              <div>
                <Label htmlFor="name">Nama</Label>
                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full" />
                <InputError message={errors.name} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1 block w-full" />
                <InputError message={errors.email} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="mt-1 block w-full" />
                <InputError message={errors.password} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className="mt-1 block w-full" />
                <InputError message={errors.password_confirmation} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="role">Jabatan</Label>
                <Select onValueChange={(value) => setData('role', value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((roleName) => (
                      <SelectItem key={roleName} value={roleName}>{roleName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={errors.role} className="mt-2" />
              </div>

              <div className="flex items-center gap-4">
                <Button disabled={processing}>Simpan</Button>
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
