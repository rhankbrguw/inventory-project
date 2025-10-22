<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Type;
use App\Models\Customer;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('type_id')->nullable()->after('name')->constrained('types');
        });

        $customerTypes = Type::where('group', 'customer_type')->pluck('id', 'name')->toArray();

        Customer::whereNotNull('type')->get()->each(function ($customer) use ($customerTypes) {
            if (isset($customerTypes[$customer->type])) {
                $customer->type_id = $customerTypes[$customer->type];
                $customer->save();
            }
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('type')->nullable()->after('name');
        });

        $customerTypes = Type::where('group', 'customer_type')->pluck('name', 'id')->toArray();

        Customer::whereNotNull('type_id')->get()->each(function ($customer) use ($customerTypes) {
            if (isset($customerTypes[$customer->type_id])) {
                $customer->type = $customerTypes[$customer->type_id];
                $customer->save();
            }
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['type_id']);
            $table->dropColumn('type_id');
        });
    }
};
