<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up()
    {
        Schema::table('sells', function (Blueprint $table) {
            $table->unsignedBigInteger('approved_by')->nullable()->after('status');
            $table->dateTime('approved_at')->nullable()->after('approved_by');
            $table->unsignedBigInteger('rejected_by')->nullable()->after('approved_at');
            $table->dateTime('rejected_at')->nullable()->after('rejected_by');
            $table->string('rejection_reason')->nullable()->after('rejected_at');
        });
    }

    public function down()
    {
        Schema::table('sells', function (Blueprint $table) {
            $table->dropColumn([
                'approved_by',
                'approved_at',
                'rejected_by',
                'rejected_at',
                'rejection_reason'
            ]);
        });
    }
};
