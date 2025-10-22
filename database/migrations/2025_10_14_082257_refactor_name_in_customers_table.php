<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Customer;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('name')->after('id');
        });

        Customer::withTrashed()->get()->each(function ($customer) {
            $customer->name = trim($customer->first_name . ' ' . $customer->last_name);
            $customer->save();
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name']);
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('first_name')->after('name');
            $table->string('last_name')->after('first_name');
        });

        Customer::withTrashed()->get()->each(function ($customer) {
            $parts = explode(' ', $customer->name, 2);
            $customer->first_name = $parts[0];
            $customer->last_name = $parts[1] ?? '';
            $customer->save();
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }
};
