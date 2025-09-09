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
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

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
      header={
        <h2 className="font-semibold text-xl text-foreground leading-tight">
          Buat Pengguna Baru
        </h2>
      }
    >
      <Head title="Buat Pengguna Baru" />

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Formulir Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
              <InputError message={errors.name} className="mt-2" />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
              <InputError message={errors.email} className="mt-2" />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
              <InputError message={errors.password} className="mt-2" />
            </div>

            <div>
              <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
              <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
              <InputError message={errors.password_confirmation} className="mt-2" />
            </div>

            <div>
              <Label htmlFor="role">Jabatan</Label>
              <Select onValueChange={(value) => setData('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((roleName) => (
                    <SelectItem key={roleName} value={roleName}>{roleName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={errors.role} className="mt-2" />
            </div>

            <div className="flex items-center gap-4 justify-end">
              <Link href={route('users.index')}>
                <Button type="button" variant="outline">Batal</Button>
              </Link>
              <Button disabled={processing}>Simpan</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
}
