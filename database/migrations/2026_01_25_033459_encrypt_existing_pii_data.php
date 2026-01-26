<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;

return new class() extends Migration {
    public function up(): void
    {
        $users = DB::table('users')->get();
        foreach ($users as $user) {
            if ($user->phone && strlen($user->phone) < 50) {
                try {
                    DB::table('users')->where('id', $user->id)->update([
                        'phone' => Crypt::encryptString($user->phone),
                    ]);
                } catch (\Exception) {
                    //
                }
            }
        }

        $customers = DB::table('customers')->get();
        foreach ($customers as $customer) {
            if ($customer->address && strlen($customer->address) < 200) {
                try {
                    DB::table('customers')->where('id', $customer->id)->update([
                        'address' => Crypt::encryptString($customer->address),
                    ]);
                } catch (\Exception) {
                    //
                }
            }
        }
    }

    public function down(): void
    {
        $users = DB::table('users')->get();
        foreach ($users as $user) {
            if ($user->phone) {
                try {
                    $plain = Crypt::decryptString($user->phone);
                    DB::table('users')->where('id', $user->id)->update([
                        'phone' => $plain,
                    ]);
                } catch (\Exception) {
                    //
                }
            }
        }

        $customers = DB::table('customers')->get();
        foreach ($customers as $customer) {
            if ($customer->address) {
                try {
                    $plain = Crypt::decryptString($customer->address);
                    DB::table('customers')->where('id', $customer->id)->update([
                        'address' => $plain,
                    ]);
                } catch (\Exception) {
                    //
                }
            }
        }
    }
};
